import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {sousTache, Statut} from "../../models/sousTache.model";

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";
type PrioriteTache = "Highest" | "High" | "Medium" | "Low" | "Lowest" | null;

interface CalendarDay {
  date: Date;
  dayNumber: number;
  otherMonth: boolean;
}

interface PieceJointe {
  nom: string;
  url: string;
  type: 'fichier' | 'lien';
  taille?: number;
  dateAjout: Date;
}

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit, OnChanges, OnDestroy {
  editingDescription = false;
  tempDescription = '';
  @Output() fermer = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();
  @Output() updateDescription = new EventEmitter<string>();
  @Output() coverColorChanged = new EventEmitter<{id: number, color: string}>();
  @Input() tache!: Tache;
  showDatePicker = false;
  showPriorityPicker = false;
  currentMonth = new Date();
  calendarDays: CalendarDay[] = [];
  hasStartDate = false;
  hasDueDate = false;
  startDateValue = '';
  dueDateValue = '';
  dueTimeValue = '20:00';
  selectedDate: Date | null = null;
  dateErrorMessage: string | null = null;

  showAttachmentModal = false;
  newAttachmentUrl = '';
  attachmentName = '';
  attachmentFiles: File[] = [];
  activeTab: 'lien' | 'fichier' = 'lien';
  @ViewChild('fileInput') fileInput!: ElementRef;

  priorites: PrioriteTache[] = ["Highest", "High", "Medium", "Low", "Lowest", null];
  availableCoverColors = ['red', 'green', 'blue', 'purple', 'yellow', 'pink', 'orange', 'teal','white'];
  selectedCoverColor: string = 'green'; // Valeur par défaut

  sousTaches: sousTache[] = [];
  sousTacheSelectionnee?: sousTache;
  showSousTacheModal = false;
  selectedSousTache?: sousTache;

  @ViewChild('datePickerContainer') datePickerContainer!: ElementRef;
  @ViewChild('priorityPickerContainer') priorityPickerContainer!: ElementRef;

  // Sujets pour contrôler la sauvegarde automatique
  private saveSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private tacheService: TacheService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Configuration du debounce pour les sauvegardes automatiques
    this.saveSubject.pipe(
      debounceTime(500), // Attendre 500ms après la dernière action
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performSave();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.tache) {
      this.chargerTache(+id);
    } else if (this.tache) {
      // Si la tâche est déjà fournie, on initialise les valeurs
      this.tempDescription = this.tache.descriptionTache;
      this.initDateValues();
      if (this.tache.priorite === undefined) {
        this.tache.priorite = null;
      }
      // Initialiser la couleur de couverture
      if (this.tache.labels && this.tache.labels.length > 0) {
        this.selectedCoverColor = this.tache.labels[0];
      } else {
        this.tache.labels = [this.selectedCoverColor];
      }
    }

    this.generateCalendarDays();

    // Écouter les changements globaux de tâches (pour synchronisation entre composants)
    this.tacheService.taches$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(taches => {
      // Si notre tâche est dans la liste mise à jour, mettre à jour notre copie locale
      if (this.tache?.idTache) {
        const updatedTache = taches.find(t => t.idTache === this.tache.idTache);
        if (updatedTache && updatedTache !== this.tache) {
          // Ne pas mettre à jour si on est en train d'éditer la description
          if (!this.editingDescription) {
            this.tache = updatedTache;
            this.tempDescription = this.tache.descriptionTache;
          }
          // Mise à jour des dates et de la couleur
          this.initDateValues();
          if (this.tache.labels && this.tache.labels.length > 0) {
            this.selectedCoverColor = this.tache.labels[0];
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer les abonnements
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tache'] && changes['tache'].currentValue) {
      this.tempDescription = this.tache.descriptionTache;
      this.initDateValues();
      // Mettre à jour la couleur lors des changements
      if (this.tache.labels && this.tache.labels.length > 0) {
        this.selectedCoverColor = this.tache.labels[0];
      }
    }
  }

  triggerAutoSave(): void {
    this.sauvegarderTacheComplete();
  }

  private performSave(): void {
    if (this.tache && this.tache.idTache) {

      this.tacheService.updateTache(this.tache).subscribe({
        next: (updatedTache) => {
        },
        error: (err) => {
          // this.isSaving = false;
          console.error('Erreur lors de la sauvegarde automatique', err);
        }
      });
    }
  }

  setCoverColor(color: string): void {
    this.selectedCoverColor = color;
    if (this.tache) {
      if (!this.tache.labels) {
        this.tache.labels = [];
      }
      this.tache.labels[0] = color;

      // Emit the change to parent components
      if (this.tache.idTache) {
        this.coverColorChanged.emit({
          id: this.tache.idTache,
          color: color
        });
      }
      if (this.tache && this.tache.idTache) {
        this.tacheService.updateCoverColor(this.tache.idTache, color).subscribe({
          next: (updatedTache) => {
            // Update will happen via BehaviorSubject
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour de la couleur', err);
          }
        });
      } else if (this.tache) {
        if (!this.tache.labels) {
          this.tache.labels = [];
        }
        if (this.tache.labels.length > 0) {
          this.tache.labels[0] = color;
        } else {
          this.tache.labels.push(color);
        }
        this.triggerAutoSave();
      }
    }
  }


  getCoverColorClass(): string {
    return this.selectedCoverColor;
  }

  editDescription(): void {
    this.editingDescription = true;
    this.tempDescription = this.tache?.descriptionTache || '';
  }

  saveDescription(): void {
    if (this.tache && this.tache.idTache) {
      this.editingDescription = false;

      // Utiliser la méthode spécifique pour mettre à jour la description
      this.tacheService.updateDescription(this.tache.idTache, this.tempDescription).subscribe({
        next: () => {
          this.updateDescription.emit(this.tempDescription);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la description', err);
        }
      });
    } else if (this.tache) {
      // Tâche locale seulement
      this.editingDescription = false;
      this.tache.descriptionTache = this.tempDescription;
      this.updateDescription.emit(this.tache.descriptionTache);
      this.triggerAutoSave();
    }
  }

  cancelEditDescription(): void {
    this.editingDescription = false;
  }

  chargerTache(id: number): void {
    this.tacheService.getTacheById(id).subscribe({
      next: (t) => {
        if (t) {
          this.tache = {
            ...t,
            members: t.members || (t.assigneA ? [t.assigneA] : []),
            checklist: t.checklist || [],
            labels: t.labels || [this.selectedCoverColor],
            statut: this.validateStatut(t.statut)
          };
          this.tempDescription = this.tache.descriptionTache;
          if (this.tache.labels && this.tache.labels.length > 0) {
            this.selectedCoverColor = this.tache.labels[0];
          }
          this.initDateValues();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement de la tâche:", err);
      }
    });
  }

  private validatePriorite(priorite: any): PrioriteTache {
    const prioritesValides: PrioriteTache[] = ["Highest", "High", "Medium", "Low", "Lowest", null];
    return prioritesValides.includes(priorite) ? priorite : null;
  }

  // Méthode de sauvegarde remplacée par triggerAutoSave et performSave
  private saveTache(): void {
    this.triggerAutoSave();
  }

  deleteTache(): void {
    if (this.tache?.idTache) {
      if (this.route.snapshot.paramMap.get('id')) {
        this.tacheService.deleteTache(this.tache.idTache).subscribe(() => {
          this.router.navigate(['/']);
        });
      } else {
        this.delete.emit(this.tache.idTache);
      }
    }
  }

  getStatutValues(): StatutTache[] {
    return ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
  }

  private validateStatut(statut: any): StatutTache {
    const statutsValides: StatutTache[] = ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
    return statutsValides.includes(statut) ? statut : "ToDo";
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  toggleDatePicker(event?: MouseEvent): void {
    this.showDatePicker = !this.showDatePicker;

    // Fermer le sélecteur de priorité s'il est ouvert
    this.showPriorityPicker = false;

    if (this.showDatePicker) {
      this.dateErrorMessage = null;
      this.initDateValues();
      this.generateCalendarDays();
      setTimeout(() => {
        this.positionDatePicker(event);
      });
    }
  }

  positionDatePicker(event?: MouseEvent): void {
    if (!this.datePickerContainer || !event) return;

    const container = this.datePickerContainer.nativeElement;

    const rect = (event.target as HTMLElement).getBoundingClientRect();

    const top = rect.top;
    const left = rect.right + 10;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const calendarWidth = container.offsetWidth;
    const calendarHeight = container.offsetHeight;

    if (left + calendarWidth > windowWidth) {
      container.style.left = (rect.left - calendarWidth - 10) + 'px';
    } else {
      container.style.left = left + 'px';
    }

    if (top + calendarHeight > windowHeight) {
      container.style.top = (windowHeight - calendarHeight - 10) + 'px';
    } else {
      container.style.top = top + 'px';
    }
  }

  togglePriorityPicker(event?: MouseEvent): void {
    this.showPriorityPicker = !this.showPriorityPicker;

    this.showDatePicker = false;

    if (this.showPriorityPicker && event) {
      setTimeout(() => {
        this.positionPriorityPicker(event);
      });
    }
  }

  positionPriorityPicker(event?: MouseEvent): void {
    if (!this.priorityPickerContainer || !event) return;

    const container = this.priorityPickerContainer.nativeElement;
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // Position the picker right below the button
    const top = rect.bottom + 5;
    const left = rect.left;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pickerWidth = container.offsetWidth;
    const pickerHeight = container.offsetHeight;
    if (left + pickerWidth > windowWidth) {
      container.style.left = (windowWidth - pickerWidth - 10) + 'px';
    } else {
      container.style.left = left + 'px';
    }
    if (top + pickerHeight > windowHeight) {
      container.style.top = (rect.top - pickerHeight - 5) + 'px';
    } else {
      container.style.top = top + 'px';
    }
  }

  initDateValues(): void {
    if (this.tache) {
      // Initialiser les valeurs de date à partir de la tâche
      this.hasStartDate = !!this.tache.dateDebut;
      this.hasDueDate = !!this.tache.dateFin;

      if (this.hasStartDate && this.tache.dateDebut) {
        const startDate = new Date(this.tache.dateDebut);
        this.startDateValue = this.formatDateForInput(startDate);
        this.currentMonth = new Date(startDate);
      }

      if (this.hasDueDate && this.tache.dateFin) {
        const dueDate = new Date(this.tache.dateFin);
        this.dueDateValue = this.formatDateForInput(dueDate);

        // heure et les minutes
        const hours = dueDate.getHours().toString().padStart(2, '0');
        const minutes = dueDate.getMinutes().toString().padStart(2, '0');
        this.dueTimeValue = `${hours}:${minutes}`;

        if (!this.hasStartDate) {
          this.currentMonth = new Date(dueDate);
        }
      }
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateCalendarDays(): void {
    this.calendarDays = [];

    // Premier jour du mois
    const firstDayOfMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      1
    );

    // Dernier jour du mois
    const lastDayOfMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      0
    );

    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();

    // Ajouter les jours du mois précédent
    const previousMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      0
    );

    const daysInPreviousMonth = previousMonth.getDate();

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth(),
        daysInPreviousMonth - i
      );

      this.calendarDays.push({
        date,
        dayNumber: daysInPreviousMonth - i,
        otherMonth: true
      });
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth(),
        i
      );

      this.calendarDays.push({
        date,
        dayNumber: i,
        otherMonth: false
      });
    }

    // Ajouter les jours du mois suivant (42 jours = 6 semaines)
    const totalDaysNeeded = 42;
    const remainingDays = totalDaysNeeded - this.calendarDays.length;

    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1,
        i
      );

      this.calendarDays.push({
        date,
        dayNumber: i,
        otherMonth: true
      });
    }
  }

  moveCalendarMonth(delta: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + delta,
      1
    );
    this.generateCalendarDays();
  }

  moveCalendarYear(delta: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear() + delta,
      this.currentMonth.getMonth(),
      1
    );
    this.generateCalendarDays();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selectedDate) return false;

    return (
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  selectDate(date: Date): void {
    this.selectedDate = date;

    const formattedDate = this.formatDateForInput(date);

    // si start date is checked mais pas due date, il faut choisir
    if (this.hasStartDate && !this.hasDueDate) {
      this.startDateValue = formattedDate;
    }
    // si date fin est checked but not start, par défaut on met today
    else if (this.hasDueDate && !this.hasStartDate) {
      this.dueDateValue = formattedDate;
    }
    // prioriser due date si deux non checked
    else if (this.hasDueDate) {
      this.dueDateValue = formattedDate;
    } else if (this.hasStartDate) {
      this.startDateValue = formattedDate;
    }

    this.updateTacheDates();
  }

  validateDates(): boolean {
    this.dateErrorMessage = null;

    if (this.hasStartDate && this.hasDueDate && this.startDateValue && this.dueDateValue) {
      const startDate = new Date(this.startDateValue);
      const dueDate = new Date(this.dueDateValue);
      startDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < startDate) {
        this.dateErrorMessage = "La date de fin ne peut pas être antérieure à la date de début!";
        return false;
      }
    }

    return true;
  }

  updateStartDate(): void {
    if (!this.hasStartDate) {
      this.tache.dateDebut = null;
    } else if (!this.startDateValue) {
      //default today
      const today = new Date();
      this.startDateValue = this.formatDateForInput(today);
    }
    this.validateDates();
    this.updateTacheDates();
  }

  updateDueDate(): void {
    if (!this.hasDueDate) {
      this.tache.dateFin = null;
    } else if (!this.dueDateValue) {

      const today = new Date();
      this.dueDateValue = this.formatDateForInput(today);
    }
    this.validateDates();
    this.updateTacheDates();
  }

  updateTacheDates(): void {
    if (!this.tache) return;

    const startDate = this.hasStartDate && this.startDateValue ? new Date(this.startDateValue) : null;
    const dueDate = this.hasDueDate && this.dueDateValue ? new Date(this.dueDateValue) : null;

    // Si la date de fin est définie, ajouter l'heure
    if (dueDate) {
      const [hours, minutes] = this.dueTimeValue.split(':').map(Number);
      dueDate.setHours(hours, minutes);
    }

    if (this.tache.idTache) {
      // Utiliser la méthode spécifique pour mettre à jour les dates
      if (this.validateDates()) {
        this.tacheService.updateTacheDates(this.tache.idTache, startDate, dueDate).subscribe({
          error: (err) => {
            console.error('Erreur lors de la mise à jour des dates', err);
          }
        });
      }
    } else {
      // Mise à jour locale
      this.tache.dateDebut = startDate;
      this.tache.dateFin = dueDate;

      if (this.validateDates()) {
        this.triggerAutoSave();
      }
    }
  }

  getPriorityLabel(priorite: PrioriteTache): string {
    if (!priorite) return 'No Priority';

    return priorite;
  }

  setPriority(priorite: PrioriteTache): void {
    if (this.tache && this.tache.idTache) {
      this.tacheService.updateTachePriority(this.tache.idTache, priorite).subscribe({
        next: () => {
          this.showPriorityPicker = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la priorité', err);
        }
      });
    } else if (this.tache) {
      this.tache.priorite = priorite;
      this.triggerAutoSave();
      this.showPriorityPicker = false;
    }
  }

  saveDates(): void {
    if (!this.validateDates()) {
      return;
    }

    this.updateTacheDates();
    this.toggleDatePicker();
  }

  clearDates(): void {
    this.hasStartDate = false;
    this.hasDueDate = false;
    this.startDateValue = '';
    this.dueDateValue = '';
    this.dueTimeValue = '20:00';
    this.tache.dateDebut = null;
    this.tache.dateFin = null;
    // Déclencher la sauvegarde automatique
    this.triggerAutoSave();
    this.dateErrorMessage = null;
    this.toggleDatePicker();
  }

  retour(): void {
    // S'assurer que toutes les modifications sont sauvegardées avant de quitter
    this.performSave();

    if (this.route.snapshot.paramMap.get('id')) {
      this.router.navigate(['/']);
    } else {
      this.fermer.emit();
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return formatDate(date, 'dd MMMM yyyy', 'fr');
  }

  //Attachement
  toggleAttachmentModal(): void {
    this.showAttachmentModal = !this.showAttachmentModal;
    if (this.showAttachmentModal) {
      this.activeTab = 'lien';
      this.newAttachmentUrl = '';
      this.attachmentName = '';
      this.attachmentFiles = [];
    }
  }

  setActiveTab(tab: 'lien' | 'fichier'): void {
    this.activeTab = tab;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachmentFiles = Array.from(input.files);
    }
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      this.attachmentFiles = Array.from(event.dataTransfer.files);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  addLinkAttachment(): void {
    if (this.newAttachmentUrl.trim()) {
      const nom = this.attachmentName.trim() || this.getDomainFromUrl(this.newAttachmentUrl);

      const newAttachment: PieceJointe = {
        nom: nom,
        url: this.newAttachmentUrl,
        type: 'lien',
        dateAjout: new Date()
      };

      if (this.tache && this.tache.idTache) {
        this.tacheService.addAttachment(this.tache.idTache, newAttachment).subscribe({
          next: () => {
            this.newAttachmentUrl = '';
            this.attachmentName = '';
            this.showAttachmentModal = false;
          }
        });
      } else if (this.tache) {
        if (!this.tache.piecesJointes) {
          this.tache.piecesJointes = [];
        }
        this.tache.piecesJointes.push(newAttachment);
        this.triggerAutoSave();
        this.newAttachmentUrl = '';
        this.attachmentName = '';
        this.showAttachmentModal = false;
      }
    }
  }

  addFileAttachments(): void {
    if (this.attachmentFiles.length > 0) {
      if (!this.tache.piecesJointes) {
        this.tache.piecesJointes = [];
      }

      this.attachmentFiles.forEach(file => {
        const newAttachment: PieceJointe = {
          nom: file.name,
          url: URL.createObjectURL(file),
          type: 'fichier',
          taille: file.size,
          dateAjout: new Date()
        };
        this.tache.piecesJointes!.push(newAttachment);
      });

      this.triggerAutoSave();
      this.attachmentFiles = [];
      this.showAttachmentModal = false;
    }
  }

  removeAttachment(index: number): void {
    if (this.tache && this.tache.idTache) {
      this.tacheService.removeAttachment(this.tache.idTache, index).subscribe();
    } else if (this.tache && this.tache.piecesJointes) {
      this.tache.piecesJointes.splice(index, 1);
      this.triggerAutoSave();
    }
  }

  private getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  }

  // Updated subtask methods
  genererIdUnique(): number {
    return this.sousTaches.length > 0
      ? Math.max(...this.sousTaches.map(s => s.idSousTache || 0)) + 1
      : 1;
  }

  ajouterSousTache(): void {
    const nouvelleSousTache: sousTache = {
      idSousTache: this.genererIdUnique(),
      titreSousTache: 'New sub-task',
      descriptionSousTache: '',
      dateDebut: new Date().toISOString().slice(0,10),
      statut: Statut.ToDo
    };

    this.sousTaches.push(nouvelleSousTache);
    this.selectedSousTache = nouvelleSousTache;
    this.showSousTacheModal = true;
  }
  //open existant sub-task
  ouvrirSousTache(s: sousTache): void {
    this.selectedSousTache = {...s};
    this.showSousTacheModal = true;
  }

// Méthode pour sauvegarder
  sauvegarderSousTache(updatedSousTache: sousTache): void {
    const index = this.sousTaches.findIndex(t => t.idSousTache === updatedSousTache.idSousTache);

    if (index !== -1) {
      // Màj de la sous-tâche existante
      this.sousTaches[index] = updatedSousTache;
    } else {
      this.sousTaches.push(updatedSousTache);
    }

    this.fermerModalSousTache();
    this.triggerAutoSave();
  }

  supprimerSousTache(idSousTache: number): void {
    this.sousTaches = this.sousTaches.filter(s => s.idSousTache !== idSousTache);
    this.fermerModalSousTache();
    this.triggerAutoSave();
  }

  fermerModalSousTache(): void {
    this.showSousTacheModal = false;
    this.selectedSousTache = undefined;
  }

  private sauvegarderTacheComplete(): void {
    this.tacheService.updateTache({
      ...this.tache,
      sousTaches: this.sousTaches
    }).subscribe(() => {
      console.log('Tâche et sous-tâches sauvegardées avec succès');
    });
  }
}
