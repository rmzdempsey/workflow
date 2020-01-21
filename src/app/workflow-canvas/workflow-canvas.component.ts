import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import * as _ from "lodash";
import { nextId, Utils, WorkflowModel, UndoEntry, DirectionalHit, RectWorkflowNode, DiamondWorkflowNode, CircleWorkflowNode, WorkflowNode, WorkflowEdge } from './workflow.model';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  model : WorkflowModel;
  clipBoard: WorkflowModel;
  undoStack: Array<UndoEntry> = [];
  undoStackIndex: number = -1;

  isSelecting: boolean;
  isDragging: boolean;
  isConnecting: boolean;
  resizeHit: DirectionalHit;
  sourceHit: DirectionalHit;
  targetHit: DirectionalHit;
  selectionStartX: number;
  selectionStartY: number;
  startDragX: number;
  startDragY: number;
  selectionEndX: number;
  selectionEndY: number;
  connectingX: number;
  connectingY: number;
  
  newTask(){
    this.addNode( new RectWorkflowNode(
      100,
      100,
      100,
      100,
    ))
  }

  newDecision(){
    this.addNode( new DiamondWorkflowNode(
      100,
      100,
      100,
      100,
    ))
  }

  newTerminator(){
    this.addNode( new CircleWorkflowNode(
      100,
      100,
      30,
    ))
  }

  addNode(n:WorkflowNode){
    this.model.nodes.forEach(n=>n.selected=false);
    this.model.nodes.push(n)
    this.postEdit("ADD");
  }

  ngOnInit() {
    this.model=new WorkflowModel();
    this.postEdit("INIT");
  }

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    // we will write this logic later
  }

  onPointerDown(e:PointerEvent){
    this.isSelecting = false;
    this.isDragging = false;
    this.resizeHit = null;

    if(this.sourceHit){
      this.isConnecting=true;
      this.connectingX=this.sourceHit.x;
      this.connectingY=this.sourceHit.y;
      return
    }

    let resizeHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointResize(e.offsetX,e.offsetY))
    if(resizeHits.length>0){
      this.resizeHit = resizeHits[0].containsPointResize(e.offsetX,e.offsetY)
      return
    }

    let hitN : WorkflowNode = this.model.nodes.slice().reverse().find(n=>n.containsPoint(e.offsetX,e.offsetY))
    let hitE : WorkflowEdge = this.model.edges.slice().reverse().find(n=>n.containsPoint(this,e.offsetX,e.offsetY))

    console.log('hit edge', hitE)

    if(!hitN && !hitE){
      this.model.nodes.forEach(n=>n.selected=false);
      this.model.edges.forEach(e=>e.selected=false);
      this.isSelecting = true;
      this.selectionStartX = e.offsetX;
      this.selectionStartY = e.offsetY;
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY;
    }
    else{
      this.isDragging = true;
      this.startDragX = e.offsetX;
      this.startDragY = e.offsetY;
      if(hitN){
        if(!hitN.selected){
          this.model.nodes.forEach(n=>n.selected=false);
          this.model.edges.forEach(n=>n.selected=false);
          hitN.selected = true;
        }
        hitN.selected = true;
        (e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
      }
      if(hitE){
        if(!hitE.selected){
          this.model.nodes.forEach(n=>n.selected=false);
          this.model.edges.forEach(n=>n.selected=false);
          hitE.selected = true;
        }
        hitE.selected = true;
        //(e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
      }
    }
  }

  onPointerUp(e:PointerEvent){
    if( this.sourceHit && this.targetHit ){
      this.model.edges.push(new WorkflowEdge(this.sourceHit.node.id,this.sourceHit.direction,this.targetHit.node.id,this.targetHit.direction))
      this.postEdit("NEW EDGE")
    }
    else if( this.isDragging ){
      (e.srcElement as HTMLElement).releasePointerCapture(e.pointerId);
      if( this.startDragX != e.offsetX || this.startDragY != e.offsetY )
        this.postEdit("MOVE")
    }
    this.isDragging = false;
    this.isSelecting = false;
    this.isConnecting = false;
    this.resizeHit = null;
    this.sourceHit=null;
    this.targetHit=null;
  }

  onPointerMove(e:PointerEvent){
    this.targetHit = null;
    if(this.isConnecting){
      this.connectingX=e.offsetX;
      this.connectingY=e.offsetY;
      let targetHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>n.id!=this.sourceHit.node.id)
      if(targetHits.length>0){
        this.targetHit = targetHits[0].containsPointConnection(e.offsetX,e.offsetY);
        return
      }
      return;
    }
    this.sourceHit = null;
    if( this.resizeHit ){
      this.resizeHit.node.resize(this.resizeHit.direction,e.movementX,e.movementY)
    }
    else if( this.isDragging ){
      this.model.nodes.filter(n=>n.selected)
      .forEach(n=>{
        n.x = n.x + e.movementX
        n.y = n.y + e.movementY
      })
    }
    else if( this.isSelecting ){
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY
      this.model.nodes.filter(n=> n.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
        .forEach(n=>n.selected=true)
      this.model.edges.filter(ee=> ee.isInsideRect(this,this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
        .forEach(n=>n.selected=true)
    }
    else{
      let sourceHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>!n.selected)
      if(sourceHits.length>0){
        this.sourceHit = sourceHits[0].containsPointConnection(e.offsetX,e.offsetY);
        return
      }
    }
  }

  getSelectionStartX():number{
    if( this.selectionStartX<=this.selectionEndX) return this.selectionStartX;
    else return this.selectionEndX;
  }

  getSelectionStartY():number{
    if( this.selectionStartY<=this.selectionEndY) return this.selectionStartY;
    else return this.selectionEndY
  }

  getSelectionWidth():number{
    let x :Array<number>= Utils.orderValues(this.selectionStartX,this.selectionEndX)
    return Math.abs(x[1]-x[0]);
  }

  getSelectionHeight():number{
    let y :Array<number>= Utils.orderValues(this.selectionStartY,this.selectionEndY)
    return Math.abs(y[1]-y[0]);
  }

  connectionPath():string{
    return `M ${this.sourceHit.x} ${this.sourceHit.y} L ${this.connectingX} ${this.connectingY}`
  }

  postEdit(editType:string){
    let cloned :WorkflowModel= _.cloneDeep(this.model);
    while(this.undoStack.length>this.undoStackIndex+1){
      this.undoStack.pop();
    }
    this.undoStack.push({desc:editType,model:cloned});
    this.undoStackIndex=this.undoStack.length-1;
  }

  undo(){
    if(this.undoStackIndex>0){
      this.undoStackIndex=this.undoStackIndex-1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex].model);
      this.model=peekModel;
    }
  }
  redo(){
    if(this.undoStackIndex<this.undoStack.length-1){
      this.undoStackIndex=this.undoStackIndex+1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex].model);
      this.model=peekModel;
    }
  }
  copy(){
    this.putSelectionOnClipboard()
  }
  paste(){
    if( this.clipBoard ){
      this.model.nodes.forEach(n=>n.selected=false)
      this.model.edges.forEach(e=>e.selected=false)
      let clip = _.cloneDeep(this.clipBoard)
      clip.nodes.forEach(n=>{
        let newId = nextId();
        let oldId = n.id;
        n.id = newId;
        clip.edges.forEach(e=>{
          if(e.sourceId==oldId) e.sourceId = newId;
          if(e.targetId==oldId) e.targetId = newId;
        })
      })
      clip.nodes.forEach(n=>{
        n.selected=true;
        this.model.nodes.push(n);
      })
      clip.edges.forEach(e=>{
        e.selected=true;
        this.model.edges.push(e);
      })
      this.postEdit("PASTE")
    }
  }
  cut(){
    this.putSelectionOnClipboard()
    this.delete();
  }
  delete(){
    const nodes :Array<WorkflowNode> = this.model.nodes.filter(n=>n.selected)
    const edges :Array<WorkflowEdge> = this.model.edges.filter(e=>e.selected)
    edges.forEach(e=>{
      let idx = this.model.edges.indexOf(e);
      if(idx != -1 ) this.model.edges.splice(idx,1) 
    })
    nodes.forEach(n=>{
      let idx = this.model.nodes.indexOf(n);
      if(idx != -1 ) this.model.nodes.splice(idx,1) 
    })
    const edgesToDelete = this.model.edges.filter(e=>!(this.model.nodes.find(n=>n.id==e.sourceId)&&this.model.nodes.find(n=>n.id==e.targetId)));
    edgesToDelete.forEach(e=>{
      let idx = this.model.edges.indexOf(e);
      if(idx != -1 ) this.model.edges.splice(idx,1)
    })
    this.postEdit("DELETE");
  }

  putSelectionOnClipboard(){
    const nodes :Array<WorkflowNode> = _.cloneDeep( this.model.nodes.filter(n=>n.selected))
    const edges :Array<WorkflowEdge> = _.cloneDeep( this.model.edges.filter(e=>e.selected))
    const edgesToDelete = edges.filter(e=>!(nodes.find(n=>n.id==e.sourceId)&&nodes.find(n=>n.id==e.targetId)));
    edgesToDelete.forEach(e=>{
      let idx = edges.indexOf(e);
      if(idx != -1 ) edges.splice(idx,1)
    })
    if(nodes.length!=0||edges.length!=0){
      this.clipBoard = new WorkflowModel(nodes,edges);
    }
  }
}

