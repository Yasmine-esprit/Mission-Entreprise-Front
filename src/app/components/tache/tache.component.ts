import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { sousTache, Statut } from "../../models/sousTache.model";
import { ProjetService } from 'src/app/service/projet.service';
import {PieceJointe} from "src/app/models/tache.model";
import {sousTacheService} from "../../service/sousTache.service";

type StatutTache = "ToDo" | "INPROGRESS" | "DONE" | "Test" | "VALIDATED" | "CANCELED";
type PrioriteTache = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST" | null;

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
export class TacheComponent implements OnInit, OnChanges, OnDestroy {
  editingDescription = false;
  tempDescription = '';
  @Output() fermer = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();
  @Output() updateDescription = new EventEmitter<string>();
  @Output() coverColorChanged = new EventEmitter<{id: number, color: string}>();
  @Input() tache!: Tache;
  @Output() taskSaved = new EventEmitter<Tache>();
  @Output() taskUpdated = new EventEmitter<Tache>();
  showDatePicker = false;
  showPriorityPicker = false;
  currentMonth = new Date();
  calendarDays: CalendarDay[] = [];
  hasStartDate = false;
  hasDueDate = false;
  startDateValue = '';
  dueDateValue = '';
  dueTimeValue = '20:00';
  activeTab: 'lien' | 'fichier' = 'lien';
  selectedDate: Date | null = null;
  dateErrorMessage: string | null = null;
  showMembersModal = false;
  availableMembers: string[] = [];
  selectedMembers: string[] = [];

  showAttachmentModal = false;
  newAttachmentUrl = '';
  attachmentName = '';
  attachmentFiles: File[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;
  isSaving: boolean = false;

  priorites: PrioriteTache[] = ["HIGHEST", "HIGH", "MEDIUM", "LOW", "LOWEST", null];
  availableCoverColors = ['red', 'green', 'blue', 'purple', 'yellow', 'pink', 'orange', 'teal','white'];
  selectedCoverColor: string = 'green';

  sousTaches: sousTache[] = [];
  sousTacheSelectionnee?: sousTache;
  showSousTacheModal = false;
  selectedSousTache?: sousTache;

  @ViewChild('datePickerContainer') datePickerContainer!: ElementRef;
  @ViewChild('priorityPickerContainer') priorityPickerContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
    private tacheService: TacheService,
    private sousTacheService: sousTacheService,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get task from route state or load from service
    const taskFromState = history.state.task;
    if (taskFromState) {
      this.tache = {
        ...taskFromState,
        dateDebut: taskFromState.dateDebut ? new Date(taskFromState.dateDebut) : null,
        dateFin: taskFromState.dateFin ? new Date(taskFromState.dateFin) : null,
        piecesJointes: taskFromState.piecesJointes || [],
        sousTaches: taskFromState.sousTaches || []
      };
      this.initTaskData();
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.chargerTache(+id);
      }
    }

    this.generateCalendarDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tache'] && changes['tache'].currentValue) {
      this.initTaskData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initTaskData(): void {
    this.tempDescription = this.tache.descriptionTache || '';
    this.initDateValues();

    if (this.tache.priorite === undefined) {
      this.tache.priorite = null;
    }

    if (this.tache.labels && this.tache.labels.length > 0) {
      this.selectedCoverColor = this.tache.labels[0];
    } else {
      this.tache.labels = [this.selectedCoverColor];
    }

    if (this.tache.sousTaches) {
      this.sousTaches = [...this.tache.sousTaches];
    }
  }

  chargerTache(id: number): void {
    this.tacheService.getTacheById(id).subscribe({
      next: (t) => {
        if (t) {
          this.tache = {
            ...t,
            members: t.members || (t.assigneA ? [t.assigneA] : []),
            checklist: t.checklist || [],
            labels: t.labels || [this.selectedCoverColor || 'white'],
            statut: this.validateStatut(t.statut),
            dateDebut: t.dateDebut ? new Date(t.dateDebut) : null,
            dateFin: t.dateFin ? new Date(t.dateFin) : null,
            piecesJointes: t.piecesJointes || [],
            sousTaches: t.sousTaches || []
          };
          this.initTaskData();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement de la tâche:", err);
      }
    });
  }

  private validateStatut(statut: StatutTache | undefined): StatutTache {
    const validStatuts: StatutTache[] = ["ToDo", "INPROGRESS", "DONE", "Test", "VALIDATED", "CANCELED"];
    return statut && validStatuts.includes(statut) ? statut : "ToDo";
  }

  editDescription(): void {
    this.editingDescription = true;
    this.tempDescription = this.tache?.descriptionTache || '';
  }

  saveTask(): void {
    if (!this.tache) return;

    this.isSaving = true;

    // Update the task with current form data
    this.updateTaskWithFormData();

    if (this.isLocalTask(this.tache)) {
      // For local tasks, we need to create them in the backend
      const { idTache, isLocal, ...taskToCreate } = this.tache;

      this.tacheService.addTache(taskToCreate as Tache).subscribe({
        next: (createdTask) => {
          this.isSaving = false;
          this.router.navigate(['/kanban'], {
            state: { updatedTask: createdTask }
          });
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.isSaving = false;
        }
      });
    } else {
      // For existing tasks, update them
      this.tacheService.updateTache(this.tache).subscribe({
        next: (updatedTask) => {
          this.isSaving = false;
          this.router.navigate(['/kanban'], {
            state: { updatedTask: updatedTask }
          });
        },
        error: (err) => {
          console.error('Error updating task:', err);
          this.isSaving = false;
        }
      });
    }
  }

  private updateTaskWithFormData(): void {
    // Update dates
    if (this.hasStartDate && this.startDateValue) {
      this.tache.dateDebut = new Date(this.startDateValue);
    } else {
      this.tache.dateDebut = null;
    }

    if (this.hasDueDate && this.dueDateValue) {
      const dueDate = new Date(this.dueDateValue);
      const [hours, minutes] = this.dueTimeValue.split(':').map(Number);
      dueDate.setHours(hours, minutes);
      this.tache.dateFin = dueDate;
    } else {
      this.tache.dateFin = null;
    }

    // Update cover color
    if (!this.tache.labels) this.tache.labels = [];
    this.tache.labels[0] = this.selectedCoverColor;

    // Update subtasks
    this.tache.sousTaches = [...this.sousTaches];
  }

  cancel(): void {
    this.router.navigate(['/kanban']);
  }

  deleteTache(): void {
    if (this.tache?.idTache && !this.isLocalTask(this.tache)) {
      this.tacheService.deleteTache(this.tache.idTache).subscribe({
        next: () => {
          this.router.navigate(['/kanban']);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
        }
      });
    } else {
      // For local tasks or when in parent component context
      this.delete.emit(this.tache?.idTache);
      this.router.navigate(['/kanban']);
    }
  }

  // Rest of your existing methods (date handling, priority, etc.) remain the same
  // ... [keep all your existing helper methods like toggleDatePicker, selectDate, etc.]

  setPriority(priorite: PrioriteTache): void {
    if (!this.tache) return;
    this.tache.priorite = priorite;
  }

  setCoverColor(color: string): void {
    this.selectedCoverColor = color;
  }

  // Date handling methods
  initDateValues(): void {
    if (this.tache) {
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



  private sauvegarderTacheComplete(): void {
    this.tacheService.updateTache({
      ...this.tache,
      sousTaches: this.sousTaches
    }).subscribe(() => {
      console.log('Tâche et sous-tâches sauvegardées avec succès');
    });
  }


  getStatutTermine(): Statut {
    return Statut.DONE;
  }

  enregistrerTache(): void {
    if (this.tache) {
      // Si la tâche a un ID, c'est une mise à jour
      if (this.tache.idTache) {
        this.tacheService.updateTache(this.tache).subscribe({
          next: (tacheMaj) => {
            console.log('Tâche mise à jour avec succès', tacheMaj);
            // Émettre un événement ou naviguer selon vos besoins
            this.fermer.emit();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour de la tâche', err);
          }
        });
      } else {
        this.tacheService.addTache(this.tache).subscribe({
          next: (nouvelleTache) => {
            console.log('Tâche créée avec succès', nouvelleTache);
            this.tache = nouvelleTache;
            this.fermer.emit();
          },
          error: (err) => {
            console.error('Erreur lors de la création de la tâche', err);
          }
        });
      }
    }
  }
  // Navigation/UI Methods
  retour(): void {
    this.router.navigate(['/kanban']);
  }


  toggleDatePicker(event?: MouseEvent): void {
    this.showDatePicker = !this.showDatePicker;
    if (this.showDatePicker) {
      this.generateCalendarDays();
      setTimeout(() => this.positionDatePicker(event));
    }
  }

  togglePriorityPicker(event?: MouseEvent): void {
    this.showPriorityPicker = !this.showPriorityPicker;
    if (this.showPriorityPicker) {
      setTimeout(() => this.positionPriorityPicker(event));
    }
  }
  generateCalendarDays(): void {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    const days: CalendarDay[] = [];

    // Calculate days from the previous month to fill the first week
    const startDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() - i - 1);
      days.push({ date, dayNumber: date.getDate(), otherMonth: true });
    }

    // Add days of the current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), d);
      days.push({ date, dayNumber: d, otherMonth: false });
    }

    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const date = new Date(last);
      date.setDate(last.getDate() + 1);
      days.push({ date, dayNumber: date.getDate(), otherMonth: true });
    }

    this.calendarDays = days;
  }


  toggleMembersModal(): void {
    this.showMembersModal = !this.showMembersModal;
    if (this.showMembersModal) {
      this.selectedMembers = [...this.tache.members || []];
    }
  }

  toggleAttachmentModal(): void {
    this.showAttachmentModal = !this.showAttachmentModal;
    if (this.showAttachmentModal) {
      this.newAttachmentUrl = '';
      this.attachmentName = '';
      this.attachmentFiles = [];
    }
  }

// Data Methods
  saveDescription(): void {
    if (this.tache) {
      this.tache.descriptionTache = this.tempDescription;
      this.editingDescription = false;
    }
  }
  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      // Convert FileList to Array and add to attachmentFiles
      const files = Array.from(event.dataTransfer.files);
      this.attachmentFiles.push(...files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.attachmentFiles.push(...files);
      input.value = '';
    }
  }


  cancelEditDescription(): void {
    this.editingDescription = false;
    this.tempDescription = this.tache?.descriptionTache || '';
  }


  saveDates(): void {
    if (!this.validateDates()) return;

    console.log('=== AVANT ENVOI ===');
    console.log('ID Tâche:', this.tache.idTache);
    console.log('startDateValue:', this.startDateValue);
    console.log('dueDateValue:', this.dueDateValue);

    this.tacheService.updateTacheDates(this.tache.idTache!, this.startDateValue, this.dueDateValue)
      .subscribe({
        next: updatedTache => {
          console.log('=== RÉPONSE BACKEND ===');
          console.log('Tâche mise à jour complète:', updatedTache);
          this.tache = updatedTache;
        },
        error: err => {
          console.error('=== ERREUR COMPLÈTE ===');
          console.error('Erreur HTTP:', err);
          console.error('Statut:', err.status);
          console.error('Message:', err.message);
          console.error('Corps de l\'erreur:', err.error);
        }
      });
  }



  validateDates(): boolean {
    if (this.hasStartDate && this.hasDueDate) {
      const start = new Date(this.startDateValue);
      const due = new Date(this.dueDateValue);
      if (start > due) {
        this.dateErrorMessage = 'Start date cannot be after due date.';
        return false;
      }
    }
    this.dateErrorMessage = null;
    return true;
  }

  updateTacheDates(): void {
    if (this.hasStartDate && this.startDateValue) {
      this.tache.dateDebut = new Date(this.startDateValue);
    } else {
      this.tache.dateDebut = null;
    }

    if (this.hasDueDate && this.dueDateValue) {
      const dueDate = new Date(this.dueDateValue);
      const [hours, minutes] = this.dueTimeValue.split(':').map(Number);
      dueDate.setHours(hours, minutes);
      this.tache.dateFin = dueDate;
    } else {
      this.tache.dateFin = null;
    }
  }



  clearDates(): void {
    this.hasStartDate = false;
    this.hasDueDate = false;
    this.startDateValue = '';
    this.dueDateValue = '';
    this.tache.dateDebut = null;
    this.tache.dateFin = null;
    this.showDatePicker = false;
  }

  saveMembers(): void {
    if (this.tache) {
      this.tache.members = [...this.selectedMembers];
      this.showMembersModal = false;
    }
  }

  cancelMemberSelection(): void {
    this.showMembersModal = false;
  }

  addLinkAttachment(): void {
    if (this.newAttachmentUrl.trim() && this.tache?.idTache) {
      const newAttachment: PieceJointe = {
        nom: this.attachmentName.trim() || this.getDomainFromUrl(this.newAttachmentUrl),
        url: this.newAttachmentUrl,
        type: 'LIEN',
        dateAjout: new Date()
      } as PieceJointe; // Type assertion if needed

      this.tacheService.addAttachment(this.tache.idTache, newAttachment)
        .subscribe({
          next: (updatedTache) => {
            this.tache = updatedTache;
            this.resetAttachmentForm();
            this.toggleAttachmentModal();
          },
          error: (error) => {
            console.error('Error adding link attachment:', error);
          }
        });
    }
  }

  addFileAttachments(): void {
    if (this.attachmentFiles.length > 0 && this.tache?.idTache) {
      this.attachmentFiles.forEach(file => {
        this.uploadFileAndAddAttachment(file);
      });
      this.toggleAttachmentModal();
    }
  }


  removeAttachmentWithRefresh(tacheId?: number, pieceJointeId?: number): void {
    if (tacheId == null || pieceJointeId == null) return;
    this.tacheService.removeAttachmentAndRefresh(tacheId, pieceJointeId)
      .subscribe({
        next: (updatedTache: Tache) => {
          this.tache = updatedTache;
        },
        error: (error) => {
          console.error('Error removing attachment:', error);
        }
      });
  }


  private refreshTask(tacheId: number): void {
    this.tacheService.getTacheById(tacheId)
      .subscribe({
        next: (tache: Tache | null) => {
          if (tache) {
            this.tache = tache;
          } else {
            console.warn('Tâche non trouvée pour ID:', tacheId);
          }
        },
        error: (error) => {
          console.error('Error refreshing task:', error);
        }
      });
  }


  uploadFileAndAddAttachment(file: File): void {
    if (!this.tache?.idTache) {
      console.error('Cannot upload file - task ID is missing');
      return;
    }

    this.isSaving = true;

    this.tacheService.uploadFile(this.tache.idTache, file).subscribe({
      next: (response) => {
        if (response.success && response.pieceJointe) {
          // Update the task with the new attachment
          if (!this.tache.piecesJointes) {
            this.tache.piecesJointes = [];
          }
          this.tache.piecesJointes.push(response.pieceJointe);
        }
        this.isSaving = false;
        this.resetAttachmentForm();
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.isSaving = false;
      }
    });
  }

  resetAttachmentForm(): void {
    this.newAttachmentUrl = '';
    this.attachmentName = '';
    this.attachmentFiles = [];
  }

// Subtasks Methods
  ajouterSousTache(): void {
    const nouvelleSousTache: sousTache = {
      titreSousTache: 'New sub-task',
      descriptionSousTache: '',
      dateDebut: new Date().toISOString().slice(0, 10),
      statut: Statut.ToDo,
      tache: {
        idTache: this.tache.idTache!
      }
    };
    this.selectedSousTache = nouvelleSousTache;
    this.showSousTacheModal = true;
  }


  ouvrirSousTache(sousTache: sousTache): void {
    this.selectedSousTache = {...sousTache};
    this.showSousTacheModal = true;
  }

  sauvegarderSousTache(updatedSousTache: sousTache): void {
    // Si la sous-tâche a déjà un ID => update
    if (updatedSousTache.idSousTache) {
      this.sousTacheService.update(updatedSousTache.idSousTache, updatedSousTache).subscribe({
        next: (res) => {
          const index = this.sousTaches.findIndex(t => t.idSousTache === res.idSousTache);
          if (index !== -1) {
            this.sousTaches[index] = res;
          }
          this.fermerModalSousTache();
        },
        error: (err) => console.error('Erreur mise à jour sous-tâche :', err)
      });
    } else {
      updatedSousTache.tache = { idTache: this.tache.idTache! };

      this.sousTacheService.create(updatedSousTache).subscribe({
        next: (res) => {
          this.sousTaches.push(res);
          this.fermerModalSousTache();
        },
        error: (err) => console.error('Erreur création sous-tâche :', err)
      });
    }
  }


  supprimerSousTache(idSousTache: number): void {
    this.sousTacheService.delete(idSousTache).subscribe({
      next: () => {
        this.sousTaches = this.sousTaches.filter(s => s.idSousTache !== idSousTache);
        this.fermerModalSousTache();
      },
      error: (err) => console.error('Erreur suppression sous-tâche :', err)
    });
  }


  fermerModalSousTache(): void {
    this.showSousTacheModal = false;
    this.selectedSousTache = undefined;
  }

// Helper Methods
  getCoverColorClass(): string {
    return this.selectedCoverColor;
  }

  getPriorityLabel(priorite: PrioriteTache): string {
    return priorite || 'No Priority';
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getCompletedSubtasksCount(): number {
    return this.sousTaches.filter(st => st.statut === Statut.DONE).length;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isLocalTask(task: Tache): boolean {
    return task.isLocal || (task.idTache !== undefined && task.idTache < 0);
  }

// Private helper methods
  private getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  }

  private genererIdUnique(): number {
    return this.sousTaches.length > 0
      ? Math.max(...this.sousTaches.map(s => s.idSousTache || 0)) + 1
      : 1;
  }

  private positionDatePicker(event?: MouseEvent): void {
    if (!this.datePickerContainer || !event) return;
    const container = this.datePickerContainer.nativeElement;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    container.style.left = `${rect.left}px`;
    container.style.top = `${rect.bottom + 5}px`;
  }

  private positionPriorityPicker(event?: MouseEvent): void {
    if (!this.priorityPickerContainer || !event) return;
    const container = this.priorityPickerContainer.nativeElement;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    container.style.left = `${rect.left}px`;
    container.style.top = `${rect.bottom + 5}px`;
  }
}
