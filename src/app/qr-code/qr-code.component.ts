import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css']
})
export class QrCodeComponent implements OnInit {
  qrCodeUrl: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const encodedData = params['data'];
      if (encodedData) {
        const decodedData = decodeURIComponent(encodedData);

        // Utilise ta logique ici pour extraire le vrai base64
        const base64Match = decodedData.match(/([A-Za-z0-9+/=]{100,})$/);
        if (base64Match && base64Match[1]) {
          this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(
            'data:image/png;base64,' + base64Match[1]
          );
        } else {
          console.warn('QR code base64 format is invalid.');
        }
      }
    });
  }
}
