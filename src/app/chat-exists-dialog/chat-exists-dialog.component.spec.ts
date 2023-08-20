import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatExistsDialogComponent } from './chat-exists-dialog.component';

describe('ChatExistsDialogComponent', () => {
  let component: ChatExistsDialogComponent;
  let fixture: ComponentFixture<ChatExistsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatExistsDialogComponent]
    });
    fixture = TestBed.createComponent(ChatExistsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
