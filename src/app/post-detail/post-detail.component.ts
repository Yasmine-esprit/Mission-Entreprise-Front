import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InteractionService, Interaction } from '../service/interaction.service';
import { PostService, Post } from '../service/post.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  postId: number | null = null;
  post: any;
  comments: Interaction[] = [];
  likedComments = new Set<number>();
  currentUserId: number | null = null;
  newCommentContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private interactionService: InteractionService,
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get current user ID from UserService
    const user = this.userService.getStoredUser();
    this.currentUserId = user ? user.idUser : null;

    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId) {
      // Fetch post details from backend
      this.postService.getById(this.postId).subscribe((post: Post) => {
        this.post = {
          title: post.titrePost,
          content: post.contenuPost,
          user: { name: post.authorName || 'Unknown', avatar: (post.authorName || '?')[0].toUpperCase() },
          time: post.datePost
        };
      });
      // Fetch comments (interactions) for this post
      this.interactionService.getByPostId(this.postId).subscribe((data: Interaction[]) => {
        this.comments = data;
      });
    }
  }

  likeComment(interactionId: number) {
    if (!this.currentUserId) {
      alert('You must be logged in to like comments.');
      return;
    }
    const userId = this.currentUserId;
    if (this.likedComments.has(interactionId)) {
      alert('You already liked this comment.');
      return;
    }
    const body = { userId };
    console.log('Sending like body:', body);
    this.interactionService.likeInteraction(interactionId, userId).subscribe({
      next: () => {
        alert('Liked!');
        this.likedComments.add(interactionId);
        // Optionally, refresh comments to update like count
      },
      error: err => {
        if (err.error && typeof err.error === 'string' && err.error.includes('already liked')) {
          alert('You already liked this comment.');
          this.likedComments.add(interactionId);
        } else {
          alert('Error: ' + (err.error?.message || 'Could not like comment'));
        }
      }
    });
  }

  addComment() {
    if (!this.currentUserId || !this.newCommentContent.trim()) {
      alert('You must be logged in and write something!');
      return;
    }
    const request = {
      dateInteraction: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      typeInteraction: 1, // or whatever type you use for comments
      postId: this.postId,
      userId: this.currentUserId,
      contenuInteraction: this.newCommentContent.trim()
    };
    this.interactionService.createInteraction(request).subscribe({
      next: () => {
        this.newCommentContent = '';
        // Refresh comments
        this.interactionService.getByPostId(this.postId!).subscribe((data: Interaction[]) => {
          this.comments = data;
        });
      },
      error: err => {
        alert('Error adding comment: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
