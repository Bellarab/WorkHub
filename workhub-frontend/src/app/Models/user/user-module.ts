import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
}

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class UserModule {}
