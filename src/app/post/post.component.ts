import { Component, OnInit } from '@angular/core';
import { PostService, Post } from '../service/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  posts: any[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getAll().subscribe((data: Post[]) => {
      this.posts = data.map(post => ({
        id: post.idPost,
        title: post.titrePost,
        preview: post.contenuPost,
        user: { name: post.authorName || 'Unknown', avatar: (post.authorName || '?')[0].toUpperCase() },
        time: post.datePost
      }));
    });
  }
}
