import { Injectable, inject } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable()
export class ErrorHandlingService {
  private toast = inject(HotToastService);

  handle(error: Error) {
    this.toast.error(error.message, { icon: '' });
  }
}
