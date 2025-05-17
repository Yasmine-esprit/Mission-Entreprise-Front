import { Component } from '@angular/core';
import {Tache} from "./models/tache.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Mission-Entreprise';
  maTache: Tache | undefined;
}
