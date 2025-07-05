import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { GroupeService } from 'src/app/service/groupe.service';
import { Groupe } from 'src/app/models/groupe.model';

@Component({
  selector: 'app-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.css']
})
export class GroupeComponent implements OnInit {
  groupes: Groupe[] = [];
  membersInput: string = '';
  @Output() groupSaved = new EventEmitter<any>();
  @Output() closePopup = new EventEmitter<void>();

  newGroupe: {
    nomGroupe: string;
    membres: string[];
    dateCreation: string;
    visibilite: string;
  } = {
    nomGroupe: '',
    membres: [],
    dateCreation: '',
    visibilite: '',
  };

  constructor(private groupeService: GroupeService) {}

  ngOnInit(): void {
    this.getGroupes();
  }

  updateMembers(value: string) {
    this.membersInput = value;
    this.newGroupe.membres = value.split(',').map(email => email.trim()).filter(email => email.length > 0);
  }

  getGroupes() {
    this.groupeService.getAll().subscribe((data: Groupe[]) => {
      this.groupes = data;
    });
  }

  addGroupe() {
    if (!this.newGroupe.nomGroupe.trim()) {
      alert('Enter a group name.');
      return;
    }

    if (!this.newGroupe.visibilite) {
      alert('Choose a visibility level.');
      return;
    }

    this.newGroupe.membres = this.newGroupe.membres
      .map(email => email.trim())
      .filter(email => email.length > 0);

    this.groupeService.add(this.newGroupe as unknown as Groupe).subscribe(() => {
      this.getGroupes();

      this.groupSaved.emit(this.newGroupe);
      this.closePopup.emit();

      this.newGroupe = {
        nomGroupe: '',
        membres: [],
        dateCreation: '',
        visibilite: '',
      };
      this.membersInput = '';
    });
  }

  deleteGroupe(id: number) {
    this.groupeService.delete(id).subscribe(() => this.getGroupes());
  }
}
