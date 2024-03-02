import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  searchId = '';
  constructor(activatedRoute: ActivatedRoute, private router: Router) {
    activatedRoute.params.subscribe((params: any) => {
      if (params.searchId) this.searchId = params.searchId;
    });
  }
  search(id: string): void {
    if (id) this.router.navigateByUrl('/search/' + id);
  }
  ngOnInit(): void {}
}
