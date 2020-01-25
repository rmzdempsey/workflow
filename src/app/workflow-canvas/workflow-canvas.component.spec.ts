import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCanvasComponent } from './workflow-canvas.component';
import { WorkflowTaskComponent } from './workflow-task/workflow-task.component';
import { RectWorkflowNode, WorkflowEdge, Direction, Utils } from './workflow.model';

describe('Utils', () => {
  it('distance on vert line to be less than 1', () => {
    expect(Utils.distanceFromLine(150,200,150,300,150,250)<1).toBeTruthy();
  });
  it('distance 10 to left of vert line to be 9.5 > d > 10.5', () => {
    let d = Utils.distanceFromLine(150,200,150,300,140,250)
    expect(d>9.5&&d<=10.5).toBeTruthy();
  });
  it('distance 10 to right of vert line to be 9.5 > d > 10.5', () => {
    let d = Utils.distanceFromLine(150,200,150,300,160,250)
    expect(d>9.5&&d<=10.5).toBeTruthy();
  });
  it('rect contains Point', () => {
    expect(Utils.rectContainsPoint(148,200,3,100,150,250)).toBeTruthy();
  });
});

fdescribe('WorkflowCanvasComponent', () => {
  let component: WorkflowCanvasComponent;
  
  beforeEach(()=>{
    component = new WorkflowCanvasComponent();
    component.ngOnInit();
  })

  

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
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(10,10)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over comp but not over connection point', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,150)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect hit over connection point', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,100)).toBeTruthy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect hit over connection point just north', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,98)).toBeTruthy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect hit over connection point just south', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,102)).toBeTruthy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect hit over connection point just east', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(152,100)).toBeTruthy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect hit over connection point just west', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(148,100)).toBeTruthy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(10,10)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss even over comp but not resize handle', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,150)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss over connection point', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,100)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss over connection point just north', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,98)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss over connection point just south', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,102)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss over connection point just east', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(152,100)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss over connection point just west', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(148,100)).toBeFalsy();
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
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(10,10)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over comp but not over connection point', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,150)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over connection point', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,100)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over connection point just north', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,98)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over connection point just south', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(150,102)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over connection point just east', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(152,100)).toBeFalsy();
      });
      it('isOverSourceConnectionPointOnlyIfNodeNotSelected should detect miss over connection point just west', () => {
        expect(component.isOverSourceConnectionPointOnlyIfNodeNotSelected(148,100)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(10,10)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect miss even over comp but not resize handle', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,150)).toBeFalsy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect hit over connection point', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,100)).toBeTruthy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect hit over connection point just north', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,98)).toBeTruthy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect hit over connection point just south', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(150,102)).toBeTruthy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect hit over connection point just east', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(152,100)).toBeTruthy();
      });
      it('isOverNodeResizePointOnlyIfNodeSelected should detect hit over connection point just west', () => {
        expect(component.isOverNodeResizePointOnlyIfNodeSelected(148,100)).toBeTruthy();
      });
    })
  })

  describe('two rect node model not connected', () => {
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

  describe('two rect node model connected by horizontal straight edge', () => {
    beforeEach(() => {
      const rect1 = new RectWorkflowNode(
        100,
        100,
        100,
        100,
      )
      component.addNode(rect1 )
      const rect2 = new RectWorkflowNode(
        300,
        100,
        100,
        100,
      )
      component.addNode( rect2 )
      component.model.edges.push(new WorkflowEdge(rect1.id,Direction.EAST,rect2.id,Direction.WEST))
    });

    describe('nothing selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=false)
        component.model.edges.forEach(n=>n.selected=false)
      });

      it('isOverEdgeNotSelected should detect miss', () => {
        expect(component.isOverEdgeNotSelected(10,10)).toBeFalsy();
      });
      it('isOverEdgeNotSelected should detect miss over shape', () => {
        expect(component.isOverEdgeNotSelected(150,150)).toBeFalsy();
      });
      it('isOverEdgeNotSelected should detect miss over east of edge', () => {
        expect(component.isOverEdgeNotSelected(199,150)).toBeFalsy()
      });
      it('isOverEdgeNotSelected should detect miss over west of edge', () => {
        expect(component.isOverEdgeNotSelected(301,150)).toBeFalsy()
      });
      it('isOverEdgeNotSelected should detect hit over edge', () => {
        expect(component.isOverEdgeNotSelected(250,150)).toBeTruthy()
      });
      it('isOverEdgeNotSelected should detect hit over edge just above', () => {
        expect(component.isOverEdgeNotSelected(250,148.1)).toBeTruthy()
      });
      it('isOverEdgeNotSelected should detect hit over edge just below', () => {
        expect(component.isOverEdgeNotSelected(250,151.9)).toBeTruthy()
      });
    });
  });

  describe('two rect node model connected by vertical straight edge', () => {
    beforeEach(() => {
      const rect1 = new RectWorkflowNode(
        100,
        100,
        100,
        100,
      )
      component.addNode(rect1 )
      const rect2 = new RectWorkflowNode(
        100,
        300,
        100,
        100,
      )
      component.addNode( rect2 )
      component.model.edges.push(new WorkflowEdge(rect1.id,Direction.SOUTH,rect2.id,Direction.NORTH))
    });

    describe('nothing selected', () => {
      beforeEach(() => {
        component.model.nodes.forEach(n=>n.selected=false)
        component.model.edges.forEach(n=>n.selected=false)
      });
      
      it('isOverEdgeNotSelected should detect miss', () => {
        expect(component.isOverEdgeNotSelected(10,10)).toBeFalsy();
      });
      it('isOverEdgeNotSelected should detect miss over shape', () => {
        expect(component.isOverEdgeNotSelected(150,150)).toBeFalsy();
      });
      it('isOverEdgeNotSelected should detect miss over east of edge', () => {
        expect(component.isOverEdgeNotSelected(150,199)).toBeFalsy()
      });
      it('isOverEdgeNotSelected should detect miss over west of edge', () => {
        expect(component.isOverEdgeNotSelected(150,301)).toBeFalsy()
      });
      it('lineContainsPoint should detect hit over edge', () => {
        // let d = Utils.distanceFromLine(150,200,150,300,150,250)
        // expect(d<1).toBeTruthy();
        // let xx : Array<number> = Utils.orderValues(150,150);
        // expect(xx[0]==150).toBeTruthy();
        // expect(xx[1]==150).toBeTruthy();
        // let yy : Array<number> = Utils.orderValues(200,300);
        // expect(yy[0]==200).toBeTruthy();
        // expect(yy[1]==300).toBeTruthy();
        expect(component.model.edges[0].lineContainsPoint(150,200,150,300,150,250)).toBeTruthy()
      });
      it('isOverEdgeNotSelected should detect hit over edge', () => {
        expect(component.isOverEdgeNotSelected(150,250)).toBeTruthy()
      });
      it('isOverEdgeNotSelected should detect hit over edge just to left', () => {
        // let d = Utils.distanceFromLine(150,200,150,300,149,250)
        // expect(d<2).toBeTruthy();
        // let xx : Array<number> = Utils.orderValues(149,150);
        // expect(xx[0]==149).toBeTruthy();
        // expect(xx[1]==150).toBeTruthy();
        // let yy : Array<number> = Utils.orderValues(200,300);
        // expect(yy[0]==200).toBeTruthy();
        // expect(yy[1]==300).toBeTruthy();
        // expect(Utils.rectContainsPoint(xx[0],yy[0],xx[1]-xx[0],yy[1]-yy[0],149,250)).toBeTruthy()
        // console.log("RMD", JSON.stringify(component.model, null, ' '))
        // expect(component.model.edges[0].lineContainsPoint(150,200,150,300,149,250)).toBeTruthy()
        // expect(component.model.edges[0].selected).toBeFalsy()
        expect(component.isOverEdgeNotSelected(148.1,250)).toBeTruthy()
      });
      it('isOverEdgeNotSelected should detect hit over edge just to right', () => {
        expect(component.isOverEdgeNotSelected(151.9,250)).toBeTruthy()
      });
    });
  });

  
});
