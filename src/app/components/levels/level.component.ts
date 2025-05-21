import { Component, OnInit } from '@angular/core';
import { LevelService } from 'src/app/service/level.service';
import { Level } from '../../models/level.model';
;

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.css']
})
export class LevelComponent implements OnInit {
  levels: Level[] = [];
  newLevel: Level = { id: 0, name: '' };

  constructor(private levelService: LevelService) {}

  ngOnInit(): void {
    this.loadLevels();
  }

  loadLevels() {
   this.levelService.getAll().subscribe((data: Level[]) => {
  this.levels = data;
})};


  addLevel() {
    this.levelService.create(this.newLevel).subscribe(() => {
      this.newLevel = { id: 0, name: '' };
      this.loadLevels();
    });
  }

  deleteLevel(id: number) {
    this.levelService.delete(id).subscribe(() => this.loadLevels());
  }
  
}
