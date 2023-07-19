import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatProfilePreviewComponent } from './chat-profile-preview.component';

describe('ChatProfilePreviewComponent', () => {
  let component: ChatProfilePreviewComponent;
  let fixture: ComponentFixture<ChatProfilePreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatProfilePreviewComponent]
    });
    fixture = TestBed.createComponent(ChatProfilePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
