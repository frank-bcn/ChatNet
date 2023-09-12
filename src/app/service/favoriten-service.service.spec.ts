import { TestBed } from '@angular/core/testing';

import { FavoritenServiceService } from './favoriten-service.service';

describe('FavoritenServiceService', () => {
  let service: FavoritenServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritenServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
