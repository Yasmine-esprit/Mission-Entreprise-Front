import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, BehaviorSubject, of, switchMap} from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { Tache, StatutTache, PrioriteTache, PieceJointe } from '../models/tache.model';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
 modifierTache(id: number, tache: Tache): Observable<Tache> {
  return this.http.put<Tache>(`${this.apiUrl}/taches/${id}`, tache);
}
 supprimerTache(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/taches/${id}`);
}
  ajouterTache(tache: Tache): Observable<Tache> {
  return this.http.post<Tache>(`${this.apiUrl}/taches`, tache);
}
  private apiUrl = 'http://localhost:8089/api/taches';
  private tachesCache = new Map<number, Tache>();
  private tachesSubject = new BehaviorSubject<Tache[]>([]);
  taches$ = this.tachesSubject.asObservable();
  private savingInProgress = new Map<number, boolean>();

  constructor(private http: HttpClient) {
    this.loadInitialTaches();
  }

  // Chargement initial depuis le localStorage
  private loadInitialTaches(): void {
    try {
      const cachedTaches = localStorage.getItem('tachesCache');
      if (cachedTaches) {
        const parsedTaches = JSON.parse(cachedTaches);
        Object.entries(parsedTaches).forEach(([key, value]) => {
          const tache = this.parseTacheDates(value as Tache);
          this.tachesCache.set(parseInt(key), tache);
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
      }
    } catch (e) {
      console.warn('Erreur lors du chargement du cache local:', e);
    }
    this.refreshAllTaches().subscribe();
  }

  // Conversion des dates string en objets Date
  private parseTacheDates(tache: Tache): Tache {
    return {
      ...tache,
      dateDebut: tache.dateDebut ? new Date(tache.dateDebut) : null,
      dateFin: tache.dateFin ? new Date(tache.dateFin) : null,
      //lastUpdated: tache.lastUpdated ? new Date(tache.lastUpdated) : null,
      //lastSynced: tache.lastSynced ? new Date(tache.lastSynced) : null
    };
  }

  // Sauvegarde dans le localStorage
  private saveToLocalStorage(): void {
    try {
      const cacheObject: Record<number, Tache> = {};
      this.tachesCache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('tachesCache', JSON.stringify(cacheObject));
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde locale:', e);
    }
  }

  // Rafraîchir toutes les tâches depuis le serveur
  refreshAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/all`).pipe(
      tap(taches => {
        taches.forEach(tache => {
          const parsedTache = this.parseTacheDates(tache);
          this.tachesCache.set(parsedTache.idTache!, {
            ...parsedTache,
            lastSynced: new Date()
          });
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Erreur lors du rafraîchissement:', error);
        return of(Array.from(this.tachesCache.values()));
      })
    );
  }

  // Obtenir toutes les tâches
  getAllTaches(forceRefresh = false): Observable<Tache[]> {
    if (forceRefresh || this.tachesCache.size === 0) {
      return this.refreshAllTaches();
    }
    return of(Array.from(this.tachesCache.values()));
  }

  // Obtenir une tâche par ID
  getTacheById(id: number): Observable<Tache> {
    if (this.tachesCache.has(id)) {
      const cachedTache = this.tachesCache.get(id)!;
      if (this.isCacheRecent(cachedTache)) {
        return of(cachedTache);
      }
    }

    return this.http.get<Tache>(`${this.apiUrl}/${id}`).pipe(
      tap(tache => {
        const parsedTache = this.parseTacheDates(tache);
        this.tachesCache.set(id, {
          ...parsedTache,
          lastSynced: new Date()
        });
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
        if (this.tachesCache.has(id)) {
          return of(this.tachesCache.get(id)!);
        }
        throw error;
      })
    );
  }

  // Ajouter une nouvelle tâche
  addTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/add`, tache).pipe(
      tap(newTache => {
        const parsedTache = this.parseTacheDates(newTache);
        this.tachesCache.set(parsedTache.idTache!, {
          ...parsedTache,
          lastSynced: new Date(),
          lastUpdated: new Date()
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Erreur lors de l\'ajout:', error);
        throw error;
      })
    );
  }

  // Mettre à jour une tâche existante
  updateTache(tache: Tache): Observable<Tache> {
    if (!tache.idTache) {
      return this.addTache(tache);
    }

    if (this.savingInProgress.get(tache.idTache)) {
      return of(tache);
    }

    this.savingInProgress.set(tache.idTache, true);

    const updatedTache = {
      ...tache,
      lastUpdated: new Date(),
      pendingChanges: true
    };

    this.tachesCache.set(tache.idTache, updatedTache);
    this.tachesSubject.next(Array.from(this.tachesCache.values()));
    this.saveToLocalStorage();

    return this.http.put<Tache>(`${this.apiUrl}/${tache.idTache}`, updatedTache).pipe(
      tap(serverTache => {
        const parsedTache = this.parseTacheDates(serverTache);
        this.tachesCache.set(tache.idTache!, {
          ...parsedTache,
          lastSynced: new Date(),
          pendingChanges: false
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de la tâche ${tache.idTache}:`, error);
        const currentTache = this.tachesCache.get(tache.idTache!);
        if (currentTache) {
          this.tachesCache.set(tache.idTache!, {
            ...currentTache,
            pendingChanges: true
          });
          this.saveToLocalStorage();
        }
        throw error;
      }),
      finalize(() => {
        this.savingInProgress.set(tache.idTache!, false);
      })
    );

  }

  // Supprimer une tâche
  deleteTache(id: number | undefined): Observable<void> {
    if (!id) {
      return of(void 0);
    }

    if (this.tachesCache.has(id)) {
      this.tachesCache.delete(id);
      this.tachesSubject.next(Array.from(this.tachesCache.values()));
      this.saveToLocalStorage();
    }

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
        throw error;
      })
    );
  }

  // Méthodes spécifiques
  updateCoverColor(tacheId: number, color: string): Observable<Tache> {
    return this.http.patch<Tache>(`${this.apiUrl}/${tacheId}/cover`, { color }).pipe(
      tap(updatedTache => {
        // Ensure this updates the BehaviorSubject
        this.tachesCache.set(tacheId, updatedTache);
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
      })
    );
  }

  updateTacheStatus(tacheId: number, statut: StatutTache): Observable<Tache> {
    return this.updateTacheProperty(tacheId, 'statut', statut);
  }

  updateTachePriority(tacheId: number, priorite: PrioriteTache): Observable<Tache> {
    return this.updateTacheProperty(tacheId, 'priorite', priorite);
  }

  updateTacheDates(tacheId: number, dateDebut: Date | null, dateFin: Date | null): Observable<Tache> {
    return this.updateTacheProperty(tacheId, 'dateDebut', dateDebut).pipe(
      switchMap(tache => this.updateTacheProperty(tacheId, 'dateFin', dateFin))
    );
  }

  addAttachment(tacheId: number, attachment: PieceJointe): Observable<Tache> {
    if (this.tachesCache.has(tacheId)) {
      const tache = this.tachesCache.get(tacheId)!;
      const piecesJointes = [...(tache.piecesJointes || [])];
      piecesJointes.push(attachment);

      return this.updateTache({
        ...tache,
        piecesJointes
      });
    }

    return this.http.post<Tache>(`${this.apiUrl}/${tacheId}/attachments`, attachment).pipe(
      tap(updatedTache => {
        const parsedTache = this.parseTacheDates(updatedTache);
        this.tachesCache.set(tacheId, {
          ...parsedTache,
          lastSynced: new Date()
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      })
    );
  }

  removeAttachment(tacheId: number, attachmentIndex: number): Observable<Tache> {
    if (this.tachesCache.has(tacheId)) {
      const tache = this.tachesCache.get(tacheId)!;
      if (!tache.piecesJointes || attachmentIndex >= tache.piecesJointes.length) {
        return of(tache);
      }

      const piecesJointes = [...tache.piecesJointes];
      piecesJointes.splice(attachmentIndex, 1);

      return this.updateTache({
        ...tache,
        piecesJointes
      });
    }

    return this.http.delete<Tache>(`${this.apiUrl}/${tacheId}/attachments/${attachmentIndex}`).pipe(
      tap(updatedTache => {
        const parsedTache = this.parseTacheDates(updatedTache);
        this.tachesCache.set(tacheId, {
          ...parsedTache,
          lastSynced: new Date()
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      })
    );
  }

  updateDescription(tacheId: number, description: string): Observable<Tache> {
    return this.updateTacheProperty(tacheId, 'descriptionTache', description);
  }

  // Méthodes utilitaires
  private updateTacheProperty<K extends keyof Tache>(
    tacheId: number,
    property: K,
    value: Tache[K]
  ): Observable<Tache> {
    if (this.tachesCache.has(tacheId)) {
      const tache = { ...this.tachesCache.get(tacheId)! };
      tache[property] = value;
      return this.updateTache(tache);
    }

    return this.http.patch<Tache>(`${this.apiUrl}/${tacheId}`, { [property]: value }).pipe(
      tap(updatedTache => {
        const parsedTache = this.parseTacheDates(updatedTache);
        this.tachesCache.set(tacheId, {
          ...parsedTache,
          lastSynced: new Date()
        });
        this.tachesSubject.next(Array.from(this.tachesCache.values()));
        this.saveToLocalStorage();
      })
    );
  }

  private isCacheRecent(tache: Tache): boolean {
    if (!tache.lastSynced) return false;
    const diffInMinutes = (new Date().getTime() - new Date(tache.lastSynced).getTime()) / (1000 * 60);
    return diffInMinutes < 5;
  }

  syncPendingChanges(): void {
    this.tachesCache.forEach((tache, id) => {
      if (tache.pendingChanges) {
        this.updateTache(tache).subscribe();
      }
    });
  }
}
