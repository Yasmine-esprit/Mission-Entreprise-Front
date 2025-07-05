import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Institution, Departement, HierarchieDTO } from '../models/institution.model';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private baseUrl = 'http://localhost:8089/api';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Fonction utilitaire pour nettoyer la récursion JSON infinie
  private cleanCircularReferences(obj: any, seen = new WeakSet()): any {
    // Si l'objet est null ou pas un objet, retourner tel quel
    if (!obj || typeof obj !== 'object') return obj;
    
    // Si l'objet a déjà été vu, retourner juste ses propriétés de base
    if (seen.has(obj)) {
      // Retourner une version simplifiée pour éviter la récursion
      if (obj.idInstitution) {
        return { idInstitution: obj.idInstitution, nomInstitution: obj.nomInstitution };
      }
      if (obj.idDepartement) {
        return { idDepartement: obj.idDepartement, nomDepartement: obj.nomDepartement };
      }
      return {};
    }
    
    // Marquer l'objet comme vu
    seen.add(obj);
    
    // Si c'est un tableau, nettoyer chaque élément
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanCircularReferences(item, seen));
    }
    
    // Sinon, nettoyer chaque propriété de l'objet
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = this.cleanCircularReferences(obj[key], seen);
      }
    }
    return cleaned;
  }

  // Institution APIs avec gestion d'erreur améliorée
  getAllInstitutions(): Observable<Institution[]> {
    return this.http.get(`${this.baseUrl}/institutions`, {
      ...this.getHttpOptions(),
      responseType: 'text'  // Récupérer comme texte brut
    }).pipe(
      map(response => {
        try {
          // Tentative de parsing du JSON brut
          let text = response;
          // Si le texte est trop long, le tronquer pour debug
          if (text.length > 5000) {
            console.log('Réponse JSON tronquée pour affichage:', text.substring(0, 5000) + '...');
          } else {
            console.log('Réponse JSON complète:', text);
          }
          
          // Essayer une approche de parsing manuelle si le texte est corrompu
          if (text.includes('institution":}')) {
            text = text.replace(/institution":}/g, 'institution":null}');
          }
          
          const parsed = JSON.parse(text);
          
          // Nettoyer les références circulaires
          const cleaned = this.cleanCircularReferences(parsed);
          console.log('JSON nettoyé:', cleaned);
          
          return Array.isArray(cleaned) ? cleaned : [cleaned];
        } catch (e) {
          console.error('Erreur parsing JSON:', e);
          console.log('Réponse brute (début):', response.substring(0, 500));
          return [];
        }
      }),
      catchError(error => {
        console.error('Erreur HTTP getAllInstitutions:', error);
        return of([]);
      })
    );
  }

  getInstitutionById(id: number): Observable<Institution> {
    return this.http.get<Institution>(`${this.baseUrl}/institutions/${id}`, this.getHttpOptions())
      .pipe(
        map(data => this.cleanCircularReferences(data)),
        catchError(error => {
          console.error(`Erreur récupération institution ${id}:`, error);
          return of({} as Institution);
        })
      );
  }

  ajouterInstitution(institution: Institution): Observable<Institution> {
    console.log('Envoi institution:', institution);
    return this.http.post<Institution>(`${this.baseUrl}/institutions`, institution, this.getHttpOptions())
      .pipe(
        map(data => this.cleanCircularReferences(data)),
        catchError(error => {
          console.error('Erreur ajout institution:', error);
          throw error;
        })
      );
  }

  modifierInstitution(id: number, institution: Institution): Observable<Institution> {
    return this.http.put<Institution>(`${this.baseUrl}/institutions/${id}`, institution, this.getHttpOptions())
      .pipe(
        map(data => this.cleanCircularReferences(data)),
        catchError(error => {
          console.error(`Erreur modification institution ${id}:`, error);
          throw error;
        })
      );
  }

  supprimerInstitution(id: number): Observable<any> {
  return this.http.delete<void>(`${this.baseUrl}/institutions/${id}`, this.getHttpOptions())
    .pipe(
      map(() => true),
      catchError(error => {
        console.error(`Erreur suppression institution ${id}:`, error);
        
        if (error.status === 404) {
          console.warn(`Institution ${id} déjà supprimée ou inexistante`);
          return of(true);
        } 
        else if (error.status === 403) {
          console.warn(`Permission refusée pour supprimer l'institution ${id}`);
          return of({ 
            success: false, 
            status: 403,
            message: "Vous n'avez pas les droits nécessaires pour supprimer cette institution." 
          });
        }
        else if (error.status === 400 || error.status === 409) {
          console.warn(`L'institution ${id} ne peut pas être supprimée car elle contient des départements`);
          return of({ 
            success: false, 
            status: error.status,
            message: "Cette institution ne peut pas être supprimée car elle contient des départements ou est utilisée par d'autres éléments."
          });
        }
        
        throw error;
      })
    );
}

  getDepartementsByInstitution(institutionId: number): Observable<Departement[]> {
    return this.http.get<Departement[]>(`${this.baseUrl}/institutions/${institutionId}/departements`, this.getHttpOptions())
      .pipe(
        map(deps => this.cleanCircularReferences(deps)),
        catchError(error => {
          console.error(`Erreur chargement départements pour institution ${institutionId}:`, error);
          return of([]);
        })
      );
  }

  // Departement APIs
  getAllDepartements(): Observable<Departement[]> {
    return this.http.get<Departement[]>(`${this.baseUrl}/departements`, this.getHttpOptions())
      .pipe(
        map(deps => this.cleanCircularReferences(deps)),
        catchError(error => {
          console.error('Erreur chargement tous départements:', error);
          return of([]);
        })
      );
  }

  getDepartementById(id: number): Observable<Departement> {
    return this.http.get<Departement>(`${this.baseUrl}/departements/${id}`, this.getHttpOptions())
      .pipe(
        map(dep => this.cleanCircularReferences(dep)),
        catchError(error => {
          console.error(`Erreur récupération département ${id}:`, error);
          return of({} as Departement);
        })
      );
  }

  ajouterDepartement(departement: Departement): Observable<Departement> {
    console.log('Envoi département:', departement);
    return this.http.post<Departement>(`${this.baseUrl}/departements`, departement, this.getHttpOptions())
      .pipe(
        map(data => this.cleanCircularReferences(data)),
        catchError(error => {
          console.error('Erreur ajout département:', error);
          throw error;
        })
      );
  }

  modifierDepartement(id: number, departement: Departement): Observable<Departement> {
    return this.http.put<Departement>(`${this.baseUrl}/departements/${id}`, departement, this.getHttpOptions())
      .pipe(
        map(data => this.cleanCircularReferences(data)),
        catchError(error => {
          console.error(`Erreur modification département ${id}:`, error);
          throw error;
        })
      );
  }

 supprimerDepartement(id: number): Observable<any> {
  return this.http.delete<void>(`${this.baseUrl}/departements/${id}`, this.getHttpOptions())
    .pipe(
      // Retourner true pour indiquer le succès
      map(() => true),
      catchError(error => {
        console.error(`Erreur suppression département ${id}:`, error);
        
        // Gérer les différents cas d'erreur
        if (error.status === 404) {
          console.warn(`Département ${id} déjà supprimé ou inexistant`);
          return of(true); // Considérer comme un succès
        } 
        else if (error.status === 403) {
          console.warn(`Permission refusée pour supprimer le département ${id}`);
          // Retourner un objet avec le statut et le message pour mieux gérer dans le composant
          return of({ 
            success: false, 
            status: 403,
            message: "Vous n'avez pas les droits nécessaires pour supprimer ce département." 
          });
        }
        else if (error.status === 400 || error.status === 409) {
          console.warn(`Le département ${id} ne peut pas être supprimé car il est utilisé par d'autres entités`);
          return of({ 
            success: false, 
            status: error.status,
            message: "Ce département ne peut pas être supprimé car il est utilisé par d'autres éléments."
          });
        }
        
        throw error;
      })
    );
}

  // Hiérarchie API
  getHierarchieComplete(): Observable<HierarchieDTO> {
    return this.http.get<HierarchieDTO>(`${this.baseUrl}/institutions/hierarchie`, this.getHttpOptions())
      .pipe(
        map(hierarchie => this.cleanCircularReferences(hierarchie)),
        catchError(error => {
          console.error('Erreur chargement hiérarchie:', error);
          return of({} as HierarchieDTO);
        })
      );
  }
}