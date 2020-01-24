import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCanvasComponent } from './workflow-canvas.component';
import { WorkflowTaskComponent } from './workflow-task/workflow-task.component';
import { RectWorkflowNode } from './workflow.model';

fdescribe('WorkflowCanvasComponent', () => {
  let component: WorkflowCanvasComponent;
  let fixture: ComponentFixture<WorkflowCanvasComponent>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [ WorkflowCanvasComponent ]
  //   })
  //   .compileComponents();
  // }));
  beforeEach(()=>{
    component = new WorkflowCanvasComponent();
    component.ngOnInit();
  })

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(WorkflowCanvasComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  describe('empty model', () => {
    it('isOverNodeOnlyIfInSelection should detect miss', () => {
      expect(component.isOverNodeOnlyIfInSelection(10,10)).toBeFalsy();
    });
  })

  describe('single rect node model', () => {
    beforeEach(() => {
      component.addNode( new RectWorkflowNode(
        100,
        100,
        100,
        100,
      ))
    });

    describe('none selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=false)
      });
      it('isOverNodeOnlyIfInSelection should detect miss', () => {
        expect(component.isOverNodeOnlyIfInSelection(10,10)).toBeFalsy();
      });
      it('isOverNodeOnlyIfInSelection should detect miss even if over first comp', () => {
        expect(component.isOverNodeOnlyIfInSelection(110,110)).toBeFalsy();
      });
    })

    describe('all selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=true)
      });
      it('isOverNodeOnlyIfInSelection should detect miss', () => {
        expect(component.isOverNodeOnlyIfInSelection(10,10)).toBeFalsy();
      });
      it('isOverNodeOnlyIfInSelection should detect hit', () => {
        expect(component.isOverNodeOnlyIfInSelection(110,110)).toBeTruthy();
      });
    })
  })

  describe('two rect node model', () => {
    beforeEach(() => {
      component.addNode( new RectWorkflowNode(
        100,
        100,
        100,
        100,
      ))
      component.addNode( new RectWorkflowNode(
        300,
        100,
        100,
        100,
      ))
    });

    describe('none selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=false)
      });
      it('isOverNodeOnlyIfInSelection should detect miss', () => {
        expect(component.isOverNodeOnlyIfInSelection(10,10)).toBeFalsy();
      });
      it('isOverNodeOnlyIfInSelection should detect miss even if over first comp', () => {
        expect(component.isOverNodeOnlyIfInSelection(110,110)).toBeFalsy();
      });
      it('isOverNodeOnlyIfInSelection should detect miss even if over second comp', () => {
        expect(component.isOverNodeOnlyIfInSelection(310,110)).toBeFalsy();
      });
    })

    describe('all selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=true)
      });
      it('isOverNodeOnlyIfInSelection should detect miss', () => {
        expect(component.isOverNodeOnlyIfInSelection(10,10)).toBeFalsy();
      });
      it('isOverNodeOnlyIfInSelection should detect hit on first', () => {
        expect(component.isOverNodeOnlyIfInSelection(110,110)).toBeTruthy();
      });
      it('isOverNodeOnlyIfInSelection should detect hit on second', () => {
        expect(component.isOverNodeOnlyIfInSelection(310,110)).toBeTruthy();
      });
    })

    
  })

  
});
