import { Component, OnInit } from '@angular/core';
import { GitRepositoryService } from '../service/git-repository.service';
import { GroupeService } from '../service/groupe.service';
import { Groupe } from '../models/groupe.model';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.css']
})
export class RepositoryComponent implements OnInit {
  repositories: { name: string; description: string; isPrivate: boolean }[] = [];

  // Modal state and form fields
  showCreateModal = false;
  newRepoName = '';
  newRepoDescription = '';
  newRepoVisibility: 'Public' | 'Private' = 'Public';
  createAttempted = false;

  searchTerm: string = '';

  showCloneModal = false;
  cloneUrl = '';
  cloneName = '';

  showBranchesModal = false;
  branchesList: string[] = [];
  branchesRepoName: string = '';

  showCreateGroupModal = false;
  groupName = '';
  groupVisibility: 'Prive' | 'Publique' | 'Par_invitation' = 'Publique';
  groupStudents = '';

  constructor(private gitService: GitRepositoryService, private groupeService: GroupeService) { }

  ngOnInit(): void {
    this.loadRepositories();
  }

  loadRepositories(): void {
    this.gitService.getLocalRepositories().subscribe({
      next: (repos) => {
        this.repositories = repos;
      },
      error: (err) => {
        console.error('Failed to load repositories:', err);
      }
    });
  }

  openCreateRepo() {
    this.showCreateModal = true;
    this.newRepoName = '';
    this.newRepoDescription = '';
    this.newRepoVisibility = 'Public';
    this.createAttempted = false;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createRepository() {
    this.createAttempted = true;
    if (!this.newRepoName || !this.newRepoName.trim()) {
      return;
    }
    this.gitService.createRepository(
      this.newRepoName.trim(),
      this.newRepoDescription,
      this.newRepoVisibility
    ).subscribe({
        next: (res) => {
          alert('Repository created: ' + res);
        // After creation, clone the repo locally
        const repoName = this.newRepoName.trim();
        const githubUrl = `https://github.com/mahdikordoghli/${repoName}.git`;
        this.gitService.cloneRepository(githubUrl, repoName).subscribe({
          next: (cloneRes) => {
            alert('Repository cloned locally: ' + cloneRes);
            this.closeCreateModal();
            this.createAttempted = false;
            this.loadRepositories();
          },
          error: (cloneErr) => {
            alert('Repository created, but failed to clone locally: ' + (cloneErr.error || cloneErr.message));
            this.closeCreateModal();
            this.createAttempted = false;
            this.loadRepositories();
          }
        });
        },
        error: (err) => {
        alert('Failed to create repo: ' + (err.error || err.message));
        }
      });
  }

  openCloneRepo() {
    this.showCloneModal = true;
    this.cloneUrl = '';
    this.cloneName = '';
  }

  closeCloneModal() {
    this.showCloneModal = false;
  }

  cloneRepositoryModal() {
    if (!this.cloneUrl.trim() || !this.cloneName.trim()) {
      alert('Both fields are required.');
      return;
    }
    this.gitService.cloneRepository(this.cloneUrl.trim(), this.cloneName.trim()).subscribe({
        next: (res) => {
          alert('Repository cloned: ' + res);
        this.closeCloneModal();
          this.loadRepositories();
        },
        error: (err) => {
        alert('Failed to clone repo: ' + (err.error || err.message));
        }
      });
    }

  showBranches(repoName: string) {
    this.gitService.getLocalBranches(repoName).subscribe({
      next: (branches) => {
        console.log('Branches response:', branches);
        this.branchesList = branches;
        this.branchesRepoName = repoName;
        this.showBranchesModal = true;
      },
      error: (err) => {
        alert(`Failed to load branches: ${err.message || err.error}`);
      }
    });
  }

  closeBranchesModal() {
    this.showBranchesModal = false;
    this.branchesList = [];
    this.branchesRepoName = '';
  }

  get filteredRepositories() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.repositories;
    return this.repositories.filter(repo => repo.name.toLowerCase().includes(term));
  }

  openCreateGroup() {
    this.showCreateGroupModal = true;
    this.groupName = '';
    this.groupVisibility = 'Publique';
    this.groupStudents = '';
  }

  closeCreateGroupModal() {
    this.showCreateGroupModal = false;
  }

  createGroup() {
    if (!this.groupName.trim()) {
      alert('Group name is required.');
      return;
    }
    // Parse students as array of numbers (IDs)
    const etudiantIds = this.groupStudents
      .split(',')
      .map(e => e.trim())
      .filter(e => e)
      .map(Number)
      .filter(id => !isNaN(id));
    const request = {
      nomGroupe: this.groupName.trim(),
      dateCreation: new Date(),
      visibilite: this.groupVisibility,
      etudiantIds: etudiantIds,
      projetId: null,
      repoId: null,
      noteTGrpIds: []
    };
    this.groupeService.createGroupe(request).subscribe({
      next: (res) => {
        alert('Group created: ' + res.nomGroupe);
        this.closeCreateGroupModal();
      },
      error: (err) => {
        alert('Failed to create group: ' + (err.error || err.message));
      }
    });
  }

}
