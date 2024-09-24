import { Routes } from '@angular/router';
import {LoginComponent} from "./iam/pages/login/login.component";
import {PageNotFoundComponent} from "./public/pages/page-not-found/page-not-found.component";
import {HomeComponent} from "./public/pages/home/home.component";
import {RegisterComponent} from "./iam/pages/register/register.component";
import {SportSpacesComponent} from "./business/pages/sport-spaces/sport-spaces.component";
import {SubscriptionComponent} from "./business/pages/subscription/subscription.component";
import {RoomsComponent} from "./business/pages/rooms/rooms.component";
import {ProfileComponent} from "./business/pages/profile/profile.component";
import {RoomDetailComponent} from "./business/pages/room-detail/room-detail.component";

export const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'sport-spaces', component: SportSpacesComponent},
  {path: 'subscriptions', component: SubscriptionComponent},
  {path: 'rooms', component: RoomsComponent},
  {path: 'room-detail/:id', component: RoomDetailComponent},
  {path: 'register', component: RegisterComponent},
  {path: '**', component:PageNotFoundComponent}
];
