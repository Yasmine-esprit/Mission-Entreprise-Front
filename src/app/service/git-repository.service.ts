import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitRepositoryService {
  private baseUrl = 'http://localhost:8081/git';
  private url = 'https://github.com/mahdikordoghli/'

  constructor(private http: HttpClient) { }

  getLocalRepositories(): Observable<{ name: string; description: string; isPrivate: boolean }[]> {
    return this.http.get<{ name: string; description: string; isPrivate: boolean }[]>(`${this.baseUrl}/local-repos`);
  }
  createRepository(repoName: string, description: string, visibility: 'Public' | 'Private'): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/create`,
      {
        repoName,
        description,
        isPrivate: visibility === 'Private'
      },
      { responseType: 'text' }
    );
  }

  cloneRepository(url: string, name: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/clone`, { url, name }, { responseType: 'text' });
  }

  getBranches(repoName: string): Observable<any[]> {
    const githubApiUrl = `https://api.github.com/repos/mahdikordoghli/${repoName}/branches`;
    return this.http.get<any[]>(githubApiUrl);
  }

  getLocalBranches(repoName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/branches/${repoName}`);
  }

}
