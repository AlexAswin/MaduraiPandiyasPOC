import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideOffCanvasComponent } from './side-off-canvas.component';

describe('SideOffCanvasComponent', () => {
  let component: SideOffCanvasComponent;
  let fixture: ComponentFixture<SideOffCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideOffCanvasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideOffCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
