import { Component, OnInit } from '@angular/core';
import { GroupeService } from 'src/app/service/groupe.service';
import { Groupe } from 'src/app/models/groupe.model';

@Component({
  selector: 'app-groupe',
  templateUrl: './groupe.component.html',
})
export class GroupeComponent implements OnInit {
  groupes: Groupe[] = [];
  newGroupe: Groupe = { nomGroupe: '', visibilite: 'PUBLIQUE' };

  constructor(private groupeService: GroupeService) {}

  ngOnInit(): void {
    this.getGroupes();
  }

  getGroupes() {
    this.groupeService.getAll().subscribe((data: Groupe[]) => {
      this.groupes = data;
    });
  }

  addGroupe() {
    this.groupeService.add(this.newGroupe).subscribe(() => {
      this.getGroupes();
      this.newGroupe = { nomGroupe: '', visibilite: 'PUBLIQUE' };
    });
  }

  deleteGroupe(id: number) {
    this.groupeService.delete(id).subscribe(() => this.getGroupes());
  }
}
