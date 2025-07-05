/* ==============================================================
 *  ThemeChoixService  — Gestion des thèmes + choix étudiant
 * =============================================================*/

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ThemeChoix, ChoixEtudiant } from '../models/theme-choix.model';

@Injectable({ providedIn: 'root' })
export class ThemeChoixService {

  private readonly baseUrl = 'http://localhost:8089/api';

  constructor(private http: HttpClient) {}

  /* ===============  CRUD THÈMES  =============== */

  /** GET /themes */
  getAllThemes(): Observable<ThemeChoix[]> {
    console.log('[ThemeChoixService] GET /themes');
    return this.http
      .get<ThemeChoix[]>(`${this.baseUrl}/themes`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /** GET /themes/{id} */
  getThemeById(id: number): Observable<ThemeChoix> {
    return this.http
      .get<ThemeChoix>(`${this.baseUrl}/themes/${id}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /** POST /themes */
  ajouterTheme(theme: ThemeChoix): Observable<ThemeChoix> {
    return this.http
      .post<ThemeChoix>(`${this.baseUrl}/themes`, theme)
      .pipe(catchError(this.handleError));
  }

  /** PUT /themes/{id} */
  modifierTheme(id: number, theme: ThemeChoix): Observable<ThemeChoix> {
    return this.http
      .put<ThemeChoix>(`${this.baseUrl}/themes/${id}`, theme)
      .pipe(catchError(this.handleError));
  }

  /** DELETE /themes/{id}
   *  options est FACULTATIF : 
   *    - headers (JWT, etc.)
   *    - params, responseType, ...
   */
  supprimerTheme(
    id: number,
    options?: { headers?: HttpHeaders; params?: HttpParams }
  ): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/themes/${id}`, options ?? {})
      .pipe(catchError(this.handleError));
  }

  /** PATCH /themes/{id}/toggle-disponibilite */
  toggleDisponibiliteTheme(id: number): Observable<ThemeChoix> {
    return this.http
      .patch<ThemeChoix>(`${this.baseUrl}/themes/${id}/toggle-disponibilite`, {})
      .pipe(catchError(this.handleError));
  }

  /* ===========  FILTRES CLASSE / GROUPE  =========== */

  getThemesByClasse(classeId: number): Observable<ThemeChoix[]> {
    return this.http
      .get<ThemeChoix[]>(`${this.baseUrl}/themes/classe/${classeId}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getThemesByGroupe(groupeId: number): Observable<ThemeChoix[]> {
    return this.http
      .get<ThemeChoix[]>(`${this.baseUrl}/themes/groupe/${groupeId}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* ===========  ASSOCIATIONS  =========== */

  associerThemeAClasse(
    themeId: number,
    classeId: number
  ): Observable<ThemeChoix> {
    return this.http
      .post<ThemeChoix>(
        `${this.baseUrl}/themes/${themeId}/associer-classe/${classeId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  associerThemeAGroupe(
    themeId: number,
    groupeId: number
  ): Observable<ThemeChoix> {
    return this.http
      .post<ThemeChoix>(
        `${this.baseUrl}/themes/${themeId}/associer-groupe/${groupeId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  /* ===========  CHOIX ÉTUDIANT  =========== */

  effectuerChoixEtudiant(choix: ChoixEtudiant): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/etudiants/choix`, choix)
      .pipe(catchError(this.handleError));
  }

  verifierChoixEffectue(etudiantId: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.baseUrl}/etudiants/${etudiantId}/choix-effectue`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* ===========  HANDLER GÉNÉRIQUE  =========== */

  private handleError(error: HttpErrorResponse) {
    let msg = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side / réseau
      msg = `Erreur: ${error.error.message}`;
    } else {
      // Backend
      switch (error.status) {
        case 404:
          msg = 'Ressource non trouvée';
          break;
        case 401:
          msg = 'Non autorisé (401)';
          break;
        case 500:
          msg = 'Erreur interne du serveur';
          break;
        case 0:
          msg = 'Serveur injoignable';
          break;
        default:
          msg = `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('[ThemeChoixService]', msg);
    return throwError(() => new Error(msg));
  }
  getChoixActuel(etudiantId: number) {
  return this.http.get<ChoixEtudiant>(`/api/choix/etudiant/${etudiantId}`);
}

}
