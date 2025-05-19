import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";
type PrioriteTache = "Highest" | "High" | "Medium" | "Low" | "Lowest" | null;

interface CalendarDay {
  date: Date;
  dayNumber: number;
  otherMonth: boolean;
}

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit, OnChanges {
  editingDescription = false;
  tempDescription = '';
  @Output() fermer = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();
  @Output() updateDescription = new EventEmitter<string>();
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
  attachmentFiles: File[] = [];

  priorites: PrioriteTache[] = ["Highest", "High", "Medium", "Low", "Lowest", null];

  @ViewChild('datePickerContainer') datePickerContainer!: ElementRef;
  @ViewChild('priorityPickerContainer') priorityPickerContainer!: ElementRef;

  constructor(
    private tacheService: TacheService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.tache) {
      this.chargerTache(+id);
    }
    if (this.tache && this.tache.priorite === undefined) {
      this.tache.priorite = null; //de undefined à null
    }

    if (this.tache) {
      this.tempDescription = this.tache.descriptionTache;
      this.initDateValues();
      if (this.tache.priorite === undefined) {
        this.tache.priorite = null;
      }
    }
    this.generateCalendarDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tache'] && changes['tache'].currentValue) {
      this.tempDescription = this.tache.descriptionTache;
      this.initDateValues();
    }
  }

  chargerTache(id: number): void {
    this.tacheService.getTacheById(id).subscribe(t => {
      if (t) {
        this.tache = {
          ...t,
          members: t.assigneA ? [t.assigneA] : [],
          checklist: t.checklist || [],
          labels: t.labels || ['green'],
          statut: this.validateStatut(t.statut),
          priorite: this.validatePriorite(t.priorite)
        };
        this.tempDescription = this.tache.descriptionTache;
      }
    });
  }

  private validatePriorite(priorite: any): PrioriteTache {
    const prioritesValides: PrioriteTache[] = ["Highest", "High", "Medium", "Low", "Lowest", null];
    return prioritesValides.includes(priorite) ? priorite : null;
  }



  editDescription(): void {
    this.editingDescription = true;
    this.tempDescription = this.tache?.descriptionTache || '';
  }

  saveDescription(): void {
    if (this.tache) {
      this.editingDescription = false;
      this.tache.descriptionTache = this.tempDescription;
      this.updateDescription.emit(this.tache.descriptionTache);
      this.saveTache();
    }
  }

  cancelEditDescription(): void {
    this.editingDescription = false;
  }

  private saveTache(): void {
    if (this.tache) {
      this.tacheService.updateTache(this.tache).subscribe({
        next: (updatedTache) => {
          this.tache = updatedTache;
          this.tempDescription = this.tache.descriptionTache;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour', err);
        }
      });
    }
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

    if (this.hasStartDate && this.startDateValue) {
      this.tache.dateDebut = new Date(this.startDateValue);
    } else {
      this.tache.dateDebut = null;
    }

    if (this.hasDueDate && this.dueDateValue) {
      const [hours, minutes] = this.dueTimeValue.split(':').map(Number);
      const dueDate = new Date(this.dueDateValue);
      dueDate.setHours(hours, minutes);
      this.tache.dateFin = dueDate;
    } else {
      this.tache.dateFin = null;
    }
    this.validateDates();
    this.saveTache();
  }

  /*getPriorityColor(priorite: PrioriteTache): string {
    if (!priorite) return '#EBECF0';
    switch (priorite) {
      case 'Highest': return '#FF5630';
      case 'High': return '#FF8B00';
      case 'Medium': return '#FFAB00';
      case 'Low': return '#51c26c';
      case 'Lowest': return '#366ab8';
      default: return '#EBECF0';
    }
  }

   getPriorityIcon(priorite: PrioriteTache): string {
    if (!priorite) return '🏷️';
    switch (priorite) {
      case 'Highest': return '⬆️⬆️';
      case 'High': return '⬆️';
      case 'Medium': return '➖';
      case 'Low': return '⬇️';
      case 'Lowest': return '⬇️⬇️';
      default: return '🏷️';
    }
  } */

  getPriorityLabel(priorite: PrioriteTache): string {
    if (!priorite) return 'No Priority';

    return priorite;
  }

  setPriority(priorite: PrioriteTache): void {
    if (this.tache) {
      this.tache.priorite = priorite;
      this.saveTache();
      this.showPriorityPicker = false;
    }
  }

  saveDates(): void {
    if (!this.validateDates()) {
      return;
    }

    this.updateTacheDates();

    if (this.route.snapshot.paramMap.get('id')) {
      this.tacheService.updateTache(this.tache).subscribe();
    }

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
    this.saveTache();
    this.dateErrorMessage = null;

    if (this.route.snapshot.paramMap.get('id')) {
      this.tacheService.updateTache(this.tache).subscribe();
    }

    this.toggleDatePicker();

  }

  retour(): void {
    this.saveTache();

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
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachmentFiles = Array.from(input.files);
    }
  }

  addLinkAttachment(): void {
    if (this.newAttachmentUrl.trim()) {
      if (!this.tache.piecesJointes) {
        this.tache.piecesJointes = [];
      }

      this.tache.piecesJointes.push({
        nom: this.getDomainFromUrl(this.newAttachmentUrl),
        url: this.newAttachmentUrl,
        type: 'lien',
        dateAjout: new Date()
      });

      this.saveTache();
      this.newAttachmentUrl = '';
      this.showAttachmentModal = false;
    }
  }

  addFileAttachments(): void {
    if (this.attachmentFiles.length > 0) {
      if (!this.tache.piecesJointes) { //! => attachement exists now
        this.tache.piecesJointes = [];
      }

      this.attachmentFiles.forEach(file => {
        this.tache.piecesJointes!.push({
          nom: file.name,
          url: URL.createObjectURL(file),
          type: 'fichier',
          taille: file.size,
          dateAjout: new Date()
        });
      });

      this.saveTache();
      this.attachmentFiles = [];
      this.showAttachmentModal = false;
    }
  }

  removeAttachment(index: number): void {
    if (this.tache.piecesJointes) {
      this.tache.piecesJointes.splice(index, 1);
      this.saveTache();
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
}
