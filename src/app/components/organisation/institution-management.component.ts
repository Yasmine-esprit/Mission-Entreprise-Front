import { Component, OnInit } from '@angular/core';
import { Institution, Departement } from '../../models/institution.model';
import { InstitutionService } from '../../service/institution.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-institution-management',
  templateUrl: './institution-management.component.html',
  styleUrls: ['./institution-management.component.css']
})
export class InstitutionManagementComponent implements OnInit {
  institutions: Institution[] = [];
  selectedInstitution: Institution | null = null;
  departements: Departement[] = [];

  // Formulaires
  showInstitutionForm = false;
  showDepartementForm = false;
  currentInstitution: Institution = { nomInstitution: '' };
  currentDepartement: Departement = { nomDepartement: '' };
  loading = false;
  error = '';

  constructor(private institutionService: InstitutionService) {}

  ngOnInit(): void {
    this.loadInstitutions();
  }

  loadInstitutions(): void {
    this.loading = true;
    this.error = '';
    
    this.institutionService.getAllInstitutions()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('Institutions reçues :', data);
          
          if (data && data.length > 0) {
            this.institutions = data;
            console.log('Liste institutions chargée:', this.institutions.length);
            
            // Si aucune institution n'est sélectionnée, sélectionner la première
            if (!this.selectedInstitution && this.institutions.length > 0) {
              this.selectInstitution(this.institutions[0]);
            } else if (this.selectedInstitution) {
              // Mettre à jour l'institution sélectionnée avec les données fraîches
              const updatedInstitution = this.institutions.find(
                inst => inst.idInstitution === this.selectedInstitution?.idInstitution
              );
              if (updatedInstitution) {
                // Préserver les départements déjà chargés
                const currentDepartements = this.selectedInstitution.departements;
                this.selectInstitution(updatedInstitution);
                if (currentDepartements && currentDepartements.length > 0) {
                  this.departements = currentDepartements;
                  if (this.selectedInstitution) {
                    this.selectedInstitution.departements = currentDepartements;
                  }
                }
              }
            }
          } else {
            this.institutions = [];
            console.log('Aucune institution trouvée');
          }
        },
        error: (err) => {
          console.error('Erreur chargement institutions :', err);
          this.error = 'Impossible de charger les institutions. Veuillez réessayer.';
          this.institutions = [];
        }
      });
  }

  selectInstitution(institution: Institution): void {
    this.selectedInstitution = institution;
    this.error = '';
    
    if (!institution || !institution.idInstitution) {
      this.departements = [];
      return;
    }
    
    if (institution.departements && institution.departements.length > 0) {
      console.log('Départements déjà inclus:', institution.departements);
      this.departements = institution.departements;
    } else {
      console.log('Chargement départements pour institution ID:', institution.idInstitution);
      this.loading = true;
      
      this.institutionService.getDepartementsByInstitution(institution.idInstitution)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (deps) => {
            console.log('Départements reçus:', deps);
            this.departements = deps || [];
            
            // Mettre à jour les départements dans l'objet institution pour la prochaine fois
            if (this.selectedInstitution) {
              this.selectedInstitution.departements = this.departements;
            }
          },
          error: (err) => {
            console.error('Erreur chargement départements :', err);
            this.error = 'Impossible de charger les départements';
            this.departements = [];
          }
        });
    }
  }

  // Gestion Institution
  openInstitutionForm(institution?: Institution): void {
    this.error = '';
    
    // Créer une copie propre de l'institution sans les références circulaires
    if (institution) {
      this.currentInstitution = {
        idInstitution: institution.idInstitution,
        nomInstitution: institution.nomInstitution || '',
        adresse: institution.adresse || '',
        description: institution.description || ''
      };
    } else {
      this.currentInstitution = { 
        nomInstitution: '',
        adresse: '',
        description: ''
      };
    }
    
    this.showInstitutionForm = true;
  }

  saveInstitution(): void {
    if (!this.currentInstitution.nomInstitution?.trim()) {
      this.error = 'Le nom de l\'institution est obligatoire';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    console.log('Sauvegarde institution :', this.currentInstitution);
    
    // Créer une copie propre sans propriétés inutiles pour l'API
    const cleanInstitution: Institution = {
      idInstitution: this.currentInstitution.idInstitution,
      nomInstitution: this.currentInstitution.nomInstitution.trim(),
      adresse: this.currentInstitution.adresse?.trim(),
      description: this.currentInstitution.description?.trim()
    };
    
    const action = this.currentInstitution.idInstitution
      ? this.institutionService.modifierInstitution(
          this.currentInstitution.idInstitution,
          cleanInstitution
        )
      : this.institutionService.ajouterInstitution(
          cleanInstitution
        );

    action
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          const errorMsg = this.currentInstitution.idInstitution
            ? 'Erreur lors de la modification de l\'institution'
            : 'Erreur lors de l\'ajout de l\'institution';
            
          console.error(errorMsg, err);
          this.error = `${errorMsg}: ${err.message || 'Erreur inconnue'}`;
          return of(null);
        })
      )
      .subscribe(result => {
        if (!result) return; // Géré dans le catchError
        
        console.log('Institution sauvegardée avec succès :', result);
        this.showInstitutionForm = false;
        
        // Mise à jour locale immédiate (pour un UX plus fluide)
        if (this.currentInstitution.idInstitution) {
          // Mise à jour d'une institution existante
          this.institutions = this.institutions.map(inst => 
            inst.idInstitution === result.idInstitution ? result : inst
          );
          
          // Si c'est l'institution sélectionnée, mettre à jour
          if (this.selectedInstitution?.idInstitution === result.idInstitution) {
            // Préserver les départements existants
            result.departements = this.selectedInstitution?.departements || [];
            this.selectedInstitution = result;
          }
        } else {
          // Nouvelle institution
          // Assurer que result a une propriété departements vide
          result.departements = [];
          this.institutions = [...this.institutions, result];
          // Sélectionner la nouvelle institution
          this.selectInstitution(result);
        }
      });
  }

  deleteInstitution(id: number): void {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette institution ?")) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.institutionService.supprimerInstitution(id)
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          console.error('Erreur suppression institution :', err);
          
          if (err.status === 403) {
            this.error = "Vous n'avez pas les droits nécessaires pour supprimer cette institution.";
            return of(null);
          }
          else if (err.status === 409 || err.status === 400) {
            this.error = "Cette institution ne peut pas être supprimée car elle contient des départements ou est utilisée par d'autres éléments.";
            return of(null);
          }
          
          this.error = `Erreur lors de la suppression: ${err.status === 0 
            ? 'Serveur inaccessible' 
            : err.error?.message || err.message || 'Erreur inconnue'}`;
          
          // En cas d'erreur réseau (status 0), on peut considérer que ça a fonctionné 
          // pour permettre à l'utilisateur de continuer à travailler
          if (err.status === 0 || err.status === 404) {
            return of(true); // Simuler un succès
          }
          return of(null); // Échec
        })
      )
      .subscribe(result => {
        if (result === null) return; // Échec déjà géré
        
        console.log('Institution supprimée avec succès');
        
        // Mise à jour locale immédiate
        this.institutions = this.institutions.filter(inst => inst.idInstitution !== id);
        
        // Si c'était l'institution sélectionnée, la désélectionner
        if (this.selectedInstitution?.idInstitution === id) {
          this.selectedInstitution = null;
          this.departements = [];
          
          // Si aucune institution n'est sélectionnée et qu'il en reste, sélectionner la première
          if (this.institutions.length > 0) {
            this.selectInstitution(this.institutions[0]);
          }
        }
      });
  }

  // Gestion Département
  openDepartementForm(departement?: Departement): void {
    if (!this.selectedInstitution?.idInstitution) {
      alert('Veuillez d\'abord sélectionner une institution');
      return;
    }
    
    this.error = '';
    
    // Créer une copie propre du département
    if (departement) {
      this.currentDepartement = {
        idDepartement: departement.idDepartement,
        nomDepartement: departement.nomDepartement || '',
        description: departement.description || '',
        institutionId: this.selectedInstitution.idInstitution
      };
    } else {
      this.currentDepartement = {
        nomDepartement: '',
        description: '',
        institutionId: this.selectedInstitution.idInstitution
      };
    }
    
    this.showDepartementForm = true;
  }

  saveDepartement(): void {
    if (!this.currentDepartement.nomDepartement?.trim()) {
      this.error = 'Le nom du département est obligatoire';
      return;
    }
    
    if (!this.selectedInstitution?.idInstitution) {
      this.error = 'Veuillez sélectionner une institution';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    // S'assurer que le département est lié à l'institution sélectionnée
    this.currentDepartement.institutionId = this.selectedInstitution.idInstitution;
    
    console.log('Sauvegarde département :', this.currentDepartement);
    
    // Créer une copie propre sans propriétés inutiles
    const cleanDepartement: Departement = {
      idDepartement: this.currentDepartement.idDepartement,
      nomDepartement: this.currentDepartement.nomDepartement.trim(),
      description: this.currentDepartement.description?.trim(),
      institutionId: this.currentDepartement.institutionId
    };
    
    const action = this.currentDepartement.idDepartement
      ? this.institutionService.modifierDepartement(
          this.currentDepartement.idDepartement,
          cleanDepartement
        )
      : this.institutionService.ajouterDepartement(
          cleanDepartement
        );

    action
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          const errorMsg = this.currentDepartement.idDepartement
            ? 'Erreur lors de la modification du département'
            : 'Erreur lors de l\'ajout du département';
            
          console.error(errorMsg, err);
          this.error = `${errorMsg}: ${err.message || 'Erreur inconnue'}`;
          return of(null);
        })
      )
      .subscribe(result => {
        if (!result) return; // Géré dans le catchError
        
        console.log('Département sauvegardé avec succès :', result);
        this.showDepartementForm = false;
        
        // Mise à jour locale immédiate
        if (this.currentDepartement.idDepartement) {
          // Mise à jour d'un département existant
          this.departements = this.departements.map(dept => 
            dept.idDepartement === result.idDepartement ? result : dept
          );
        } else {
          // Nouveau département
          this.departements = [...this.departements, result];
        }
        
        // Mettre à jour les départements dans l'objet institution pour la cohérence
        if (this.selectedInstitution) {
          this.selectedInstitution.departements = this.departements;
        }
      });
  }

  deleteDepartement(id: number): void {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    // Vérifier d'abord si le département existe encore dans la liste
    const deptExists = this.departements.some(d => d.idDepartement === id);
    if (!deptExists) {
      console.warn('Département déjà supprimé localement:', id);
      this.loading = false;
      return;
    }
    
    this.institutionService.supprimerDepartement(id)
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          console.error('Erreur suppression département :', err);
          
          if (err.status === 403) {
            this.error = "Vous n'avez pas les droits nécessaires pour supprimer ce département.";
            return of(null);
          }
          else if (err.status === 409 || err.status === 400) {
            this.error = "Ce département ne peut pas être supprimé car il est utilisé par d'autres éléments.";
            return of(null);
          }
          
          this.error = `Erreur lors de la suppression: ${err.status === 0 
            ? 'Serveur inaccessible' 
            : err.error?.message || err.message || 'Erreur inconnue'}`;
          
          // En cas d'erreur réseau ou 404, on peut considérer que ça a fonctionné
          if (err.status === 0 || err.status === 404) {
            return of(true); // Simuler un succès
          }
          return of(null); // Échec
        })
      )
      .subscribe(result => {
        if (result === null) return; // Échec déjà géré
        
        console.log('Département supprimé avec succès');
        
        // Mise à jour locale immédiate - doit se faire AVANT la mise à jour de selectedInstitution
        this.departements = this.departements.filter(d => d.idDepartement !== id);
        
        // Mettre à jour les départements dans l'objet institution
        if (this.selectedInstitution) {
          // Créer un nouveau tableau pour forcer la détection de changement
          this.selectedInstitution.departements = [...this.departements];
        }
      });
  }

  cancelForm(): void {
    this.showInstitutionForm = false;
    this.showDepartementForm = false;
    this.error = '';
  }
}