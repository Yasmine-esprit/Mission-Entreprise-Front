import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Observable, BehaviorSubject, throwError, of, switchMap, filter} from 'rxjs';
import { catchError, map, tap, retry, timeout } from 'rxjs/operators';
import { Tache } from '../models/tache.model';
import { sousTache } from '../models/sousTache.model';

type StatutTache = "ToDo" | "INPROGRESS" | "DONE" | "Test" | "VALIDATED" | "CANCELED";
type PrioriteTache = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST" | null;

interface PieceJointe {
  idPieceJointe?: number;
  nom?: string;
  url: string;
  type: 'FICHIER' | 'LIEN';
  dateAjout: Date;
  tache?: Tache;
}

interface TacheUpdatePayload {
  titreTache?: string;
  descriptionTache?: string;
  priorite?: PrioriteTache;
  statut?: StatutTache;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  coverColor?: string;
  assigneA?: string;
  members?: string[];
  labels?: string[];
  sousTaches?: sousTache[];
  piecesJointes?: PieceJointe[];
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private readonly apiUrl = 'http://localhost:8081/api/taches';
  private readonly timeout_duration = 10000;
  private tachesSubject = new BehaviorSubject<Tache[]>([]);
  public taches$ = this.tachesSubject.asObservable();
  private tacheCache = new Map<number, Tache>();
  private cacheExpiry = new Map<number, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  constructor(private http: HttpClient) {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getHttpOptions() {
    return {
      headers: this.getHeaders(),

      withCredentials: true
    };
  }

  private normalizePriority(priorite: any): PrioriteTache {
    if (!priorite || priorite === 'null' || priorite === '') return null;
    const normalizedPriorite = priorite.toString().toUpperCase();
    const validPriorities: PrioriteTache[] = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];
    return validPriorities.includes(normalizedPriorite as PrioriteTache) ? normalizedPriorite as PrioriteTache : null;
  }

  private normalizeStatus(statut: any): StatutTache {
    if (!statut) return 'ToDo';
    const validStatuts: StatutTache[] = ["ToDo", "INPROGRESS", "DONE", "Test", "VALIDATED", "CANCELED"];
    return validStatuts.includes(statut) ? statut : 'ToDo';
  }

  private prepareDatesForBackend(tache: any): any {
    const copy = { ...tache };
    if (copy.dateDebut instanceof Date) copy.dateDebut = copy.dateDebut.toISOString();
    if (copy.dateFin instanceof Date) copy.dateFin = copy.dateFin.toISOString();
    return copy;
  }

  private isCacheValid(id: number): boolean {
    const expiry = this.cacheExpiry.get(id);
    return expiry ? Date.now() < expiry : false;
  }

  private updateCache(tache: Tache): void {
    if (tache.idTache) {
      this.tacheCache.set(tache.idTache, tache);
      this.cacheExpiry.set(tache.idTache, Date.now() + this.CACHE_DURATION);
    }
  }

  private clearCacheTask(id: number): void {
    this.tacheCache.delete(id);
    this.cacheExpiry.delete(id);
  }

  private handleError = (error: HttpErrorResponse, context?: string): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';
    let userMessage = 'Une erreur est survenue lors de l\'opération';
    console.group(`🚨 HTTP Error ${context ? `(${context})` : ''}`);
    console.error('Full error object:', error);

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
      userMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      console.error('Client-side error:', error.error.message);
    } else {
      console.error(`Status: ${error.status}`);
      console.error('Response body:', error.error);

      switch (error.status) {
        case 400:
          if (error.error?.message?.includes('Cannot deserialize')) {
            errorMessage = 'Erreur de format des données (enum mismatch)';
            userMessage = 'Format de données invalide. Vérifiez les valeurs sélectionnées.';
          } else {
            errorMessage = 'Requête invalide';
            userMessage = 'Données invalides. Vérifiez les informations saisies.';
          }
          break;
        case 401:
          errorMessage = 'Non autorisé';
          userMessage = 'Vous devez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès interdit (probablement CSRF token)';
          userMessage = 'Accès interdit. Rechargez la page et réessayez.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          userMessage = 'Élément non trouvé.';
          break;
        case 409:
          errorMessage = 'Conflit de données';
          userMessage = 'Conflit détecté. Rechargez et réessayez.';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          userMessage = 'Erreur serveur. Contactez le support technique.';
          break;
        default:
          errorMessage = `Erreur HTTP ${error.status}: ${error.message}`;
          userMessage = 'Erreur inattendue. Réessayez plus tard.';
      }
    }

    console.groupEnd();

    return throwError(() => ({
      originalError: error,
      message: errorMessage,
      userMessage: userMessage,
      status: error.status,
      context: context
    }));
  };

  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/all`, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(2),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        tap(taches => {
          this.tachesSubject.next(taches);
          taches.forEach(tache => this.updateCache(tache));
        }),
        catchError((error) => this.handleError(error, 'getAllTaches'))
      );
  }

  getTacheById(id: number): Observable<Tache | null> {
    if (this.isCacheValid(id)) {
      const cachedTache = this.tacheCache.get(id);
      if (cachedTache) return of(cachedTache);
    }

    return this.http.get<Tache>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(2),
        map(tache => this.processTaskFromServer(tache)),
        tap(tache => { if (tache) this.updateCache(tache); }),
        catchError((error) => error.status === 404 ? of(null) : this.handleError(error, 'getTacheById'))
      );
  }

  getTachesByProjetId(projetId: number): Observable<Tache[]> {
    const params = new HttpParams().set('projetId', projetId.toString());
    return this.http.get<Tache[]>(`${this.apiUrl}/projet/${projetId}`, { ...this.getHttpOptions(), params })
      .pipe(
        timeout(this.timeout_duration),
        retry(2),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        catchError((error) => this.handleError(error, 'getTachesByProjetId'))
      );
  }

  addTache(tache: Tache): Observable<Tache> {
    const payload = this.prepareDatesForBackend(tache);
    return this.http.post<Tache>(`${this.apiUrl}/create`, payload, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(created => this.processTaskFromServer(created)),
        tap(created => { this.updateCache(created); this.refreshTachesList(); }),
        catchError((error) => this.handleError(error, 'addTache'))
      );
  }

  updateTache(tache: Tache): Observable<Tache> {
    if (!tache.idTache) return throwError(() => new Error('ID de tâche manquant'));
    const payload = this.prepareDatesForBackend(tache);
    return this.http.put<Tache>(`${this.apiUrl}/update/${tache.idTache}`, payload, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(updated => this.processTaskFromServer(updated)),
        tap(updated => { this.updateCache(updated); this.refreshTachesList(); }),
        catchError((error) => this.handleError(error, 'updateTache'))
      );
  }

  partialUpdateTache(id: number, updates: TacheUpdatePayload): Observable<Tache> {
    const payload = this.prepareDatesForBackend(updates);
    return this.http.patch<Tache>(`${this.apiUrl}/partialUpdate/${id}`, payload, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(updated => this.processTaskFromServer(updated)),
        tap(updated => { this.updateCache(updated); this.refreshTachesList(); }),
        catchError((error) => this.handleError(error, 'partialUpdateTache'))
      );
  }

  updateTacheDates(id: number, dateDebut: string | null, dateFin: string | null): Observable<Tache> {
    const payload = {
      dateDebut: dateDebut,
      dateFin: dateFin
    };

    const url = `${this.apiUrl}/dates/update/${id}`;
    console.log('=== SERVICE - REQUÊTE HTTP ===');
    console.log('URL appelée:', url);
    console.log('Payload envoyé:', payload);

    return this.http.post<Tache>(url, payload,this.getHttpOptions()).pipe(
      tap(response => {
        console.log('=== SERVICE - RÉPONSE REÇUE ===');
        console.log('Réponse:', response);
      }),
      catchError(error => {
        console.error('=== SERVICE - ERREUR ===');
        console.error('Erreur HTTP:', error);
        console.error('Statut:', error.status);
        console.error('URL qui a échoué:', url);
        throw error;
      })
    );
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        tap(() => {
          this.clearCacheTask(id);
          this.refreshTachesList();
        }),
        catchError((error) => this.handleError(error, 'deleteTache'))
      );
  }

  // ========== SPECIFIC UPDATE METHODS ==========

  /**
   * Update task priority
   */
  updateTachePriority(id: number, priorite: PrioriteTache): Observable<Tache> {
    return this.partialUpdateTache(id, { priorite });
  }

  /**
   * Update task status
   */
  updateTacheStatus(id: number, statut: StatutTache): Observable<Tache> {
    return this.partialUpdateTache(id, { statut });
  }

  /**
   * Update task description
   */
  updateDescription(id: number, description: string): Observable<Tache> {
    return this.partialUpdateTache(id, { descriptionTache: description });
  }


  /**
   * Update task cover color
   */
  updateCoverColor(id: number, color: string): Observable<Tache> {
    return this.partialUpdateTache(id, { coverColor: color, labels: [color] });
  }

  /**
   * Update task members
   */
  updateTacheMembers(id: number, members: string[]): Observable<Tache> {
    return this.partialUpdateTache(id, { members });
  }

  /**
   * Update task title
   */
  updateTacheTitle(id: number, titre: string): Observable<Tache> {
    return this.partialUpdateTache(id, { titreTache: titre });
  }

  // ========== ATTACHMENT METHODS ==========

  /**
   * Add attachment to task
   */
  addAttachment(id: number, attachment: PieceJointe): Observable<Tache> {
    return this.http.post<Tache>(
      `${this.apiUrl}/attachments/add/${id}`,
      attachment,
      this.getHttpOptions()
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle empty response case
        if (error.status === 200 && error.error instanceof ProgressEvent) {
          return throwError(() => ({
            message: 'Empty response from server',
            userMessage: 'The server returned an empty response'
          }));
        }
        return this.handleError(error, 'addAttachment');
      })
    );
  }
  uploadFile(tacheId: number, file: File): Observable<{ success: boolean; filePath?: string; pieceJointe?: PieceJointe; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{
      success: boolean;
      filePath: string;
      pieceJointe: PieceJointe;
      message?: string;
    }>(`${this.apiUrl}/files/upload/${tacheId}`, formData, {
      headers: headers,
      withCredentials: true
    }).pipe(
      timeout(this.timeout_duration),
      retry(1),
      catchError((error) => {
        console.error('File upload error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Failed to upload file'
        });
      })
    );
  }


  removeAttachmentAndRefresh(tacheId: number, pieceJointeId: number): Observable<Tache> {
    return this.http.delete<void>(
      `${this.apiUrl}/remove/${tacheId}/${pieceJointeId}`,
      {
        ...this.getHttpOptions(),
        withCredentials: true
      }
    ).pipe(
      timeout(this.timeout_duration),
      retry(1),
      switchMap(() => this.getTacheById(tacheId)),
      filter((tache): tache is Tache => tache !== null),
      tap(tache => {
        this.updateCache(tache);
      }),
      catchError((error) => this.handleError(error, 'removeAttachment'))
    );
  }



  /**
   * Add subtask to task
   */
  addSousTache(tacheId: number, sousTache: sousTache): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/${tacheId}/subtasks`,
      sousTache, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(updatedTache => this.processTaskFromServer(updatedTache)),
        tap(updatedTache => {
          this.updateCache(updatedTache);
        }),
        catchError((error) => this.handleError(error, 'addSousTache'))
      );
  }

  /**
   * Update subtask
   */
  updateSousTache(tacheId: number, sousTache: sousTache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${tacheId}/subtasks/${sousTache.idSousTache}`,
      sousTache, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(updatedTache => this.processTaskFromServer(updatedTache)),
        tap(updatedTache => {
          this.updateCache(updatedTache);
        }),
        catchError((error) => this.handleError(error, 'updateSousTache'))
      );
  }

  /**
   * Delete subtask
   */
  deleteSousTache(tacheId: number, sousTacheId: number): Observable<Tache> {
    return this.http.delete<Tache>(`${this.apiUrl}/${tacheId}/subtasks/${sousTacheId}`,
      this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(updatedTache => this.processTaskFromServer(updatedTache)),
        tap(updatedTache => {
          this.updateCache(updatedTache);
        }),
        catchError((error) => this.handleError(error, 'deleteSousTache'))
      );
  }

  // ========== UTILITY METHODS ==========

  /**
   * Process task data received from server
   */
  private processTaskFromServer(tache: any): Tache {
    return {
      ...tache,
      priorite: this.normalizePriority(tache.priorite),
      statut: this.normalizeStatus(tache.statut),
      dateDebut: tache.dateDebut ? new Date(tache.dateDebut) : null,
      dateFin: tache.dateFin ? new Date(tache.dateFin) : null,
      members: tache.members || (tache.assigneA ? [tache.assigneA] : []),
      checklist: tache.checklist || [],
      labels: tache.labels || [tache.coverColor || 'white'],
      piecesJointes: tache.piecesJointes || [],
      sousTaches: tache.sousTaches || []
    };
  }

  /**
   * Refresh the tasks list
   */
  private refreshTachesList(): void {
    // Only refresh if we have active subscribers
    if (this.tachesSubject.observers.length > 0) {
      this.getAllTaches().subscribe();
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.tacheCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cached task count (for debugging)
   */
  getCacheInfo(): { size: number, entries: number[] } {
    return {
      size: this.tacheCache.size,
      entries: Array.from(this.tacheCache.keys())
    };
  }

  /**
   * Force refresh all data
   */
  forceRefresh(): Observable<Tache[]> {
    this.clearCache();
    return this.getAllTaches();
  }

  // ========== SEARCH AND FILTER METHODS ==========

  /**
   * Search tasks by title or description
   */
  searchTaches(query: string): Observable<Tache[]> {
    const params = new HttpParams().set('search', query);

    return this.http.get<Tache[]>(`${this.apiUrl}/search`,
      { ...this.getHttpOptions(), params })
      .pipe(
        timeout(this.timeout_duration),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        catchError((error) => this.handleError(error, 'searchTaches'))
      );
  }

  /**
   * Filter tasks by status
   */
  getTachesByStatus(statut: StatutTache): Observable<Tache[]> {
    const params = new HttpParams().set('statut', statut);

    return this.http.get<Tache[]>(`${this.apiUrl}/filter`,
      { ...this.getHttpOptions(), params })
      .pipe(
        timeout(this.timeout_duration),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        catchError((error) => this.handleError(error, 'getTachesByStatus'))
      );
  }

  /**
   * Filter tasks by priority
   */
  getTachesByPriority(priorite: PrioriteTache): Observable<Tache[]> {
    const params = new HttpParams().set('priorite', priorite || '');

    return this.http.get<Tache[]>(`${this.apiUrl}/filter`,
      { ...this.getHttpOptions(), params })
      .pipe(
        timeout(this.timeout_duration),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        catchError((error) => this.handleError(error, 'getTachesByPriority'))
      );
  }

  // ========== BULK OPERATIONS ==========

  /**
   * Update multiple tasks at once
   */
  bulkUpdateTaches(updates: { id: number, updates: TacheUpdatePayload }[]): Observable<Tache[]> {
    return this.http.patch<Tache[]>(`${this.apiUrl}/bulk-update`,
      updates, this.getHttpOptions())
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        map(taches => taches.map(t => this.processTaskFromServer(t))),
        tap(taches => {
          taches.forEach(tache => this.updateCache(tache));
          this.refreshTachesList();
        }),
        catchError((error) => this.handleError(error, 'bulkUpdateTaches'))
      );
  }

  /**
   * Delete multiple tasks at once
   */
  bulkDeleteTaches(ids: number[]): Observable<void> {
    return this.http.request<void>('DELETE', `${this.apiUrl}/bulk-delete`,
      { ...this.getHttpOptions(), body: { ids } })
      .pipe(
        timeout(this.timeout_duration),
        retry(1),
        tap(() => {
          ids.forEach(id => this.clearCacheTask(id));
          this.refreshTachesList();
        }),
        catchError((error) => this.handleError(error, 'bulkDeleteTaches'))
      );
  }
}
