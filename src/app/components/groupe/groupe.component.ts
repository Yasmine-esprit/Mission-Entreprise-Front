import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GroupeService } from 'src/app/service/groupe.service';
import { Groupe, Visibilite } from 'src/app/models/groupe.model';
import {distinctUntilChanged, Observable, of, Subject, switchMap} from "rxjs";
import { HttpClient } from '@angular/common/http';
import {UserDTO} from "../../models/user-dto";
import {debounceTime} from "rxjs/operators";
import {UserService} from "src/app/service/user.service";

@Component({
  selector: 'app-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.css']
})
export class GroupeComponent implements OnInit {
  groupes: Groupe[] = [];

  availableEtudiants: UserDTO [] = [];
  filteredEtudiants: UserDTO [] = [];
  selectedEtudiants: UserDTO [] = [];
  searchTerm: string = '';
  showEtudiantDropdown: boolean = false;
  showDetailsPopup: boolean = false;
  selectedGroup: Groupe | null = null;
  showGroupCreationModal: boolean = false;
  showGroupDetailsModal: boolean = false;
  showGroupListModal = false;
  membersInput: string = '';
  showSuccessPopup: boolean = false;
  successMessage: string = '';
  @Output() groupSaved = new EventEmitter<any>();
  @Output() closePopup = new EventEmitter<void>();

  searchTerms = new Subject<string>();

  newGroupe: Groupe = {
    nomGroupe: '',
    dateCreation: new Date().toISOString(),
    visibilite: Visibilite.PRIVE,
    etudiants: [],
    //noteTGrps: [],
  };

  visibiliteOptions = [
    {value: Visibilite.PUBLIC, label: 'Public'},
    {value: Visibilite.PRIVE, label: 'Private'},
    {value: Visibilite.BY_INVITATION, label: 'By Invitation'}
  ];

  constructor(
    private groupeService: GroupeService,
    private http: HttpClient,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.getGroupes();
    this.loadEtudiants();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term.trim()) {
          return this.userService.searchEtudiantsByName(term);
        } else {
          return of(this.availableEtudiants);
        }
      })
    ).subscribe({
      next: (etudiants) => {
        this.filteredEtudiants = etudiants.filter(etudiant =>
          !this.selectedEtudiants.some(selected => selected.idUser === etudiant.idUser)
        );
        console.log('Filtered students:', this.filteredEtudiants); // Debug log
      },
      error: (err) => {
        console.error('Search error:', err);
      }
    });
  }

  loadEtudiants(): void {
    this.userService.getEtudiants().subscribe({
      next: (etudiants: UserDTO[]) => {
        this.availableEtudiants = etudiants;
        this.filteredEtudiants = [...this.availableEtudiants];
        console.log('Loaded students:', this.availableEtudiants);
      },
      error: (err) => {
        console.error('Error loading students:', err);
        alert('Error loading student list');
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchTerms.next(term);
  }

  toggleEtudiantDropdown(): void {
    this.showEtudiantDropdown = !this.showEtudiantDropdown;
    if (this.showEtudiantDropdown) {
      this.onSearchChange('');
    }
  }

  selectEtudiant(etudiant: UserDTO): void {
    if (!this.selectedEtudiants.some(selected => selected.idUser === etudiant.idUser)) {
      this.selectedEtudiants.push(etudiant);
      this.filteredEtudiants = this.filteredEtudiants.filter(e => e.idUser !== etudiant.idUser);
    }
  }

  removeEtudiant(etudiant: UserDTO): void {
    this.selectedEtudiants = this.selectedEtudiants.filter(e => e.idUser !== etudiant.idUser);
    if (!this.searchTerm || this.matchesSearch(etudiant, this.searchTerm)) {
      this.filteredEtudiants.push(etudiant);
    }
  }

  private matchesSearch(etudiant: UserDTO, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (etudiant.nomUser?.toLowerCase().includes(term) || false) ||
      (etudiant.prenomUser?.toLowerCase().includes(term) || false) ||
      etudiant.emailUser.toLowerCase().includes(term);
  }

  updateMembers(value: string) {
    this.membersInput = value;
    // Note: You'll need to decide how to handle members
    // Either convert to Etudiant objects or modify backend to accept simple strings
  }

  getGroupes() {
    this.groupeService.getAll().subscribe({
      next: (data: Groupe[]) => {
        this.groupes = data;
      },
      error: (err) => {
        console.error('Error fetching groups:', err);
        alert('Error fetching groups');
      }
    });
  }

  addGroupe(): void {
    this.newGroupe.nomGroupe = this.newGroupe.nomGroupe.trim();

    if (!this.newGroupe.nomGroupe) {
      alert('Enter Group name.');
      return;
    }

    if (!this.newGroupe.visibilite) {
      alert('Choose a visibility level.');
      return;
    }

    if (this.selectedEtudiants.length === 0) {
      alert('Select at least One Student !');
      return;
    }

    const requestData = {
      groupe: {
        nomGroupe: this.newGroupe.nomGroupe,
        visibilite: this.newGroupe.visibilite.toString()
      },
      studentEmails: this.selectedEtudiants.map(etudiant => etudiant.emailUser)
    };

    this.groupeService.addWithStudentsByEmail(requestData).subscribe({
      next: (response: Groupe) => {
        // Update the local groupes array with the complete response
        this.groupes = [...this.groupes, response];

        this.groupSaved.emit(response);
        this.successMessage = `Group "${response.nomGroupe}" created successfully with ${response.etudiants?.length || this.selectedEtudiants.length} member(s)!`;
        this.showSuccessPopup = true;

        setTimeout(() => {
          this.showSuccessPopup = false;
          this.closePopup.emit();
        }, 3000);

        this.resetForm();
      },
      error: (err) => {
        console.error('Error:', err);
        alert(`Error: ${err.error?.message || err.message}`);
      }
    });
    this.showGroupCreationModal = false;
  }

  onCancel(): void {
    this.closePopup.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.newGroupe = {
      nomGroupe: '',
      dateCreation: new Date().toISOString(),
      visibilite: Visibilite.PUBLIC,
      etudiants: [],
    };
    this.selectedEtudiants = [];
    this.searchTerm = '';
    this.showEtudiantDropdown = false;
    this.loadEtudiants();
  }

  openGroupDetails(group: Groupe): void {
    this.selectedGroup = group;
    this.showGroupDetailsModal = true;
    this.showGroupCreationModal = false; //make sure group popup est fermé
  }
  closeCreationModal(): void {
    this.showGroupCreationModal = false;
    this.resetForm();
  }

  closeDetailsModal(): void {
    this.showGroupDetailsModal = false;
    this.selectedGroup = null;
  }


  deleteGroupe(id: number | undefined): void {
    if (!id) {
      console.error('Cannot delete group: No ID provided');
      return;
    }

    if (confirm('Are you sure you want to delete this group?')) {
      this.groupeService.delete(id).subscribe({
        next: () => {
          console.log('Group deleted successfully');
          this.getGroupes();
          this.closeDetailsModal();
        },
        error: (err) => {
          console.error('Error deleting group:', err);
          alert('Error deleting group');
        }
      });
    }
  }


  getVisibilityLabel(visibilite: Visibilite): string {
    const option = this.visibiliteOptions.find(opt => opt.value === visibilite);
    return option ? option.label : 'Unknown';
  }

  onClickOutside(): void {
    this.showEtudiantDropdown = false;
  }
  getFullName(etudiant: UserDTO): string {
    return `${etudiant.prenomUser} ${etudiant.nomUser}`;
  }

  openGroupListModal() {
    this.showGroupListModal = true;
  }

  closeGroupListModal() {
    this.showGroupListModal = false;
  }

  selectGroup(group: Groupe) {
    this.selectedGroup = group;
    this.closeGroupListModal();
    this.openGroupDetails(group);
  }

}

