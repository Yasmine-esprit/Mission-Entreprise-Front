import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Niveau {
  idNiveau: number;
  nomNiveau: string;
}

export interface Departement {
  idDepartement: number;
  nomDepartement: string;
}

export interface Classe {
  idCLasse: number;
  nomClasse: string;
  niveau?: Niveau;
  departement?: Departement;
}

@Injectable({
  providedIn: 'root'
})
export class ClasseService {
  private apiUrl = 'http://localhost:8080/api/classes';
  private mockData: Classe[] = [
    { idCLasse: 1, nomClasse: 'Classe Informatique', 
      niveau: { idNiveau: 1, nomNiveau: 'Licence' },
      departement: { idDepartement: 1, nomDepartement: 'Informatique' } 
    },
    { idCLasse: 2, nomClasse: 'Classe Mathématiques', 
      niveau: { idNiveau: 2, nomNiveau: 'Master' },
      departement: { idDepartement: 2, nomDepartement: 'Mathématiques' } 
    },
    { idCLasse: 3, nomClasse: 'Classe Physique', 
      niveau: { idNiveau: 1, nomNiveau: 'Licence' },
      departement: { idDepartement: 3, nomDepartement: 'Physique' } 
    }
  ];
  
  // Activer le mode mock pour travailler sans backend
  private useMockData = true;

  constructor(private http: HttpClient) { }

  getAllClasses(): Observable<Classe[]> {
    if (this.useMockData) {
      console.log('Utilisation des données mockées pour les classes');
      return of(this.mockData);
    }
    
    return this.http.get<Classe[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des classes:', error);
        console.log('Utilisation des données mockées suite à une erreur');
        return of(this.mockData);
      })
    );
  }

  getClasseById(id: number): Observable<Classe> {
    if (this.useMockData) {
      const classe = this.mockData.find(c => c.idCLasse === id);
      return of(classe || { idCLasse: 0, nomClasse: 'Non trouvée' });
    }
    
    return this.http.get<Classe>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors du chargement de la classe ${id}:`, error);
        const classe = this.mockData.find(c => c.idCLasse === id);
        return of(classe || { idCLasse: 0, nomClasse: 'Non trouvée' });
      })
    );
  }

  ajouterClasse(classe: Classe): Observable<Classe> {
    if (this.useMockData) {
      const newId = Math.max(...this.mockData.map(c => c.idCLasse), 0) + 1;
      const newClasse = { ...classe, idCLasse: newId };
      this.mockData.push(newClasse);
      console.log('Classe ajoutée (mock):', newClasse);
      return of(newClasse);
    }
    
    return this.http.post<Classe>(this.apiUrl, classe).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout de la classe:', error);
        const newId = Math.max(...this.mockData.map(c => c.idCLasse), 0) + 1;
        const newClasse = { ...classe, idCLasse: newId };
        this.mockData.push(newClasse);
        return of(newClasse);
      })
    );
  }

  modifierClasse(id: number, classe: Classe): Observable<Classe> {
    if (this.useMockData) {
      const index = this.mockData.findIndex(c => c.idCLasse === id);
      if (index !== -1) {
        this.mockData[index] = { ...classe, idCLasse: id };
        console.log('Classe modifiée (mock):', this.mockData[index]);
      }
      return of(classe);
    }
    
    return this.http.put<Classe>(`${this.apiUrl}/${id}`, classe).pipe(
      catchError(error => {
        console.error('Erreur lors de la modification de la classe:', error);
        const index = this.mockData.findIndex(c => c.idCLasse === id);
        if (index !== -1) {
          this.mockData[index] = { ...classe, idCLasse: id };
        }
        return of(classe);
      })
    );
  }

  supprimerClasse(id: number): Observable<void> {
    if (this.useMockData) {
      this.mockData = this.mockData.filter(c => c.idCLasse !== id);
      console.log(`Classe ${id} supprimée (mock)`);
      return of(void 0);
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression de la classe:', error);
        this.mockData = this.mockData.filter(c => c.idCLasse !== id);
        return of(void 0);
      })
    );
  }
}