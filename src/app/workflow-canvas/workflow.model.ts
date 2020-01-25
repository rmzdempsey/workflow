import { WorkflowCanvasComponent } from "./workflow-canvas.component";


export class UndoEntry{
    constructor(public desc:string,public model:WorkflowModel){}
  }
  
  export class WorkflowModel{
    constructor(public nodes : Array<WorkflowNode> = [], public edges : Array<WorkflowEdge> = [] ){
  
    }
  }
  
  export class Utils {
    static orderValues(n0:number,n1:number): Array<number>{
      if( n0>n1 ){
        let tmp = n0;
        n0=n1;
        n1=tmp;
      }
      return [n0,n1]
    }
    static cirleContainsPoint(cx:number,cy:number,r:number,x:number,y:number):boolean{
      const dx = cx - x;
      const dy = cy - y;
      return r >= Math.hypot(dx,dy);
    }
    static rectContainsPoint(rx:number, ry:number, rw:number, rh: number, x:number, y:number): boolean{
        return x >= rx && x <= (rx + rw) && y >= ry && y<(ry+rh)
    }

    static distanceFromLine(x1:number, y1:number, x2:number, y2:number,x:number, y:number) :number{

      let A = x - x1;
      let B = y - y1;
      let C = x2 - x1;
      let D = y2 - y1;
    
      let dot = A * C + B * D;
      let len_sq = C * C + D * D;
      let param = -1;
      if (len_sq != 0) //in case of 0 length line
          param = dot / len_sq;
    
      let xx, yy;
    
      if (param < 0) {
        xx = x1;
        yy = y1;
      }
      else if (param > 1) {
        xx = x2;
        yy = y2;
      }
      else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
    
      let dx = x - xx;
      let dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
  
  export enum Direction {
    UNKNOWN="0",
    NORTH="N", NORTH_EAST="NE", EAST="E", SOUTH_EAST="SE", SOUTH="S", SOUTH_WEST="SW", WEST="W", NORTH_WEST="NW"
  }
  
  export class DirectionalHit {
    constructor( public direction : Direction, public node: WorkflowNode, public x:number, public y:number ){}

    getHandleX():number {
      return this.node.getX(this.direction)
    }

    getHandleY():number {
      return this.node.getY(this.direction)
    }
  }
  
  const MIN_DIMENSION: number = 20
  
  var idGen = 0;
  export function nextId() : number {
    idGen = idGen + 1;
    return idGen;
  }
  
  export abstract class WorkflowNode {
  
    constructor(public id: number, public x:number, public y: number, public selected: boolean = true ){}
  
    abstract containsPoint(x:number,y:number):boolean
    abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean
    abstract resize(direction:Direction,dx:number,dy:number)
  
    abstract getNx(): number;
    abstract getNEx(): number;
    abstract getEx(): number;
    abstract getSEx(): number;
    abstract getSx(): number;
    abstract getSWx(): number;
    abstract getWx(): number;
    abstract getNWx(): number;
  
    abstract getNy(): number;
    abstract getNEy(): number;
    abstract getEy(): number;
    abstract getSEy(): number;
    abstract getSy(): number;
    abstract getSWy(): number;
    abstract getWy(): number;
    abstract getNWy(): number;
    
    isSelected(canvas: WorkflowCanvasComponent):boolean{ 
      return this.selected && !canvas.isGroupSelecting(); 
    }
    isCanvasConnectionHit(canvas: WorkflowCanvasComponent,direction:Direction):boolean{ 
      return (canvas.getCurrentSourceConnectionHover() != null && canvas.getCurrentSourceConnectionHover().node == this && canvas.getCurrentSourceConnectionHover().direction==direction)  
      || (canvas.getCurrentTargetConnectionHover() != null && canvas.getCurrentTargetConnectionHover().node == this && canvas.getCurrentTargetConnectionHover().direction==direction)
      
    }
  
    showNorthConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH);
    }
    showNorthEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH_EAST);
    }
    showEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.EAST);
    }
    showSouthEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH_EAST);
    }
    showSouthConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH);
    }
    showSouthWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH_WEST);
    }
    showWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.WEST);
    }
    showNorthWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH_WEST);
    }
  
    containsPointResize(x:number,y:number):DirectionalHit{
      if(this.selected){
        if( Utils.cirleContainsPoint(this.getNx(),this.getNy(),5,x,y) ){
          return new DirectionalHit(Direction.NORTH,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getEx(),this.getEy(),5,x,y) ){
          return new DirectionalHit(Direction.EAST,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getSx(),this.getSy(),5,x,y) ){
          return new DirectionalHit(Direction.SOUTH,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getWx(),this.getWy(),5,x,y) ){
          return new DirectionalHit(Direction.WEST,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getNEx(),this.getNEy(),5,x,y) ){
          return new DirectionalHit(Direction.NORTH_EAST,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getNWx(),this.getNWy(),5,x,y) ){
          return new DirectionalHit(Direction.NORTH_WEST,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getSEx(),this.getSEy(),5,x,y) ){
          return new DirectionalHit(Direction.SOUTH_EAST,this,x,y);
        }
        else if( Utils.cirleContainsPoint(this.getSWx(),this.getSWy(),5,x,y) ){
          return new DirectionalHit(Direction.SOUTH_WEST,this,x,y);
        }
      }
      return null;
    }
  
    containsPointConnection(x:number,y:number):DirectionalHit{
      if( Utils.cirleContainsPoint(this.getNx(),this.getNy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH,this,this.getNx(),this.getNy());
      }
      else if( Utils.cirleContainsPoint(this.getEx(),this.getEy(),5,x,y) ){
        return new DirectionalHit(Direction.EAST,this,this.getEx(),this.getEy());
      }
      else if( Utils.cirleContainsPoint(this.getSx(),this.getSy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH,this,this.getSx(),this.getSy());
      }
      else if( Utils.cirleContainsPoint(this.getWx(),this.getWy(),5,x,y) ){
        return new DirectionalHit(Direction.WEST,this,this.getWx(),this.getWy());
      }
      else if( Utils.cirleContainsPoint(this.getNEx(),this.getNEy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH_EAST,this,this.getNEx(),this.getNEy());
      }
      else if( Utils.cirleContainsPoint(this.getNWx(),this.getNWy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH_WEST,this,this.getNWx(),this.getNWy());
      }
      else if( Utils.cirleContainsPoint(this.getSEx(),this.getSEy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH_EAST,this,this.getSEx(),this.getSEy());
      }
      else if( Utils.cirleContainsPoint(this.getSWx(),this.getSWy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH_WEST,this,this.getSWx(),this.getSWy());
      }
      return null;
    }
  
    getX(direction:Direction):number{
      if(direction==Direction.NORTH) return this.getNx();
      else if(direction==Direction.NORTH_EAST) return this.getNEx();
      else if(direction==Direction.EAST) return this.getEx();
      else if(direction==Direction.SOUTH_EAST) return this.getSEx();
      else if(direction==Direction.SOUTH) return this.getSx();
      else if(direction==Direction.SOUTH_WEST) return this.getSWx();
      else if(direction==Direction.WEST) return this.getWx();
      else return this.getNWx();
    }
  
    getY(direction:Direction):number{
      if(direction==Direction.NORTH) return this.getNy();
      else if(direction==Direction.NORTH_EAST) return this.getNEy();
      else if(direction==Direction.EAST) return this.getEy();
      else if(direction==Direction.SOUTH_EAST) return this.getSEy();
      else if(direction==Direction.SOUTH) return this.getSy();
      else if(direction==Direction.SOUTH_WEST) return this.getSWy();
      else if(direction==Direction.WEST) return this.getWy();
      else return this.getNWy();
    }
  }
  
  export class RectWorkflowNode extends WorkflowNode {
  
    constructor(x:number, y: number, public width: number, public height: number ){
      super(nextId(),x,y)
    }
  
    containsPoint(x:number,y:number):boolean{
      return Utils.rectContainsPoint(this.x,this.y,this.width,this.height,x,y)
    }
  
    isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
      let x: Array<number> = Utils.orderValues(x0,x1)
      let y: Array<number> = Utils.orderValues(y0,y1)
      return this.x >= x[0] && (this.x+this.width)<=x[1] && this.y >= y[0] && (this.y+this.height)<=y[1];
    }
  
    resize(direction:Direction,dx:number,dy:number){
      switch(direction){
        case Direction.NORTH:
          this.y = this.y + dy;
          this.height = this.height - dy;
          this.minNorth();
          break;
        case Direction.SOUTH:
          this.height = this.height + dy;
          this.minSouth();
          break;
        case Direction.WEST:
          this.x = this.x + dx;
          this.width = this.width - dx;
          this.minWest();
          break;
        case Direction.EAST:
          this.width = this.width + dx;
          this.minEast();
          break;
        case Direction.NORTH_EAST:
          this.y = this.y + dy;
          this.height = this.height - dy;
          this.width = this.width + dx;
          this.minNorth();
          this.minEast();
          break;
        case Direction.SOUTH_EAST:
          this.height = this.height + dy;
          this.width = this.width + dx;
          this.minEast();
          this.minSouth();
          break;
        case Direction.NORTH_WEST:
          this.x = this.x + dx;
          this.width = this.width - dx;
          this.y = this.y + dy;
          this.height = this.height - dy;
          this.minNorth();
          this.minWest();
          break;
        case Direction.SOUTH_WEST:
          this.x = this.x + dx;
          this.width = this.width - dx;
          this.height = this.height + dy;
          this.minSouth();
          this.minWest();
          break;
      }
    }
  
    minNorth(){
      if(this.height<MIN_DIMENSION){
        this.y = this.y - (MIN_DIMENSION - this.height);
        this.height = MIN_DIMENSION;
      }
    }
  
    minSouth(){
      if(this.height<MIN_DIMENSION) this.height = MIN_DIMENSION;
    }
  
    minEast(){
      if(this.width<MIN_DIMENSION) this.width = MIN_DIMENSION;
    }
  
    minWest(){
      if(this.width<MIN_DIMENSION){
        this.x = this.x - (MIN_DIMENSION - this.width);
        this.width = MIN_DIMENSION;
      }
    }
  
    getNx(): number { return this.x + (this.width/2); }
    getNEx(): number { return this.x + this.width; }
    getEx(): number { return this.x + this.width; }
    getSEx(): number { return this.x + this.width; }
    getSx(): number { return this.x + (this.width/2); }
    getSWx(): number { return this.x; }
    getWx(): number { return this.x; }
    getNWx(): number{ return this.x; }
  
    getNy(): number { return this.y; }
    getNEy(): number { return this.y; }
    getEy(): number { return this.y + (this.height/2); }
    getSEy(): number { return this.y + this.height; }
    getSy(): number { return this.y + this.height;; }
    getSWy(): number { return this.y + this.height;; }
    getWy(): number { return this.y + (this.height/2); }
    getNWy(): number{ return this.y; }
  }
  
  export class CircleWorkflowNode extends WorkflowNode {
  
    constructor(x:number, y: number, public radius: number ){
      super(nextId(),x,y)
    }
  
    containsPoint(x:number,y:number):boolean{
      return Utils.cirleContainsPoint(this.x,this.y,this.radius,x,y)
    }
  
    isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
      let x: Array<number> = Utils.orderValues(x0,x1)
      let y: Array<number> = Utils.orderValues(y0,y1)
      return x[0] <= (this.x-this.radius) && x[1] >= (this.x+this.radius) && y[0] <= (this.y-this.radius) && y[1] >= (this.y+this.radius)
    }
  
    resize(direction:Direction,dx:number,dy:number){
      this.radius = this.radius + dx;
      if( this.radius < MIN_DIMENSION/2 ) this.radius = MIN_DIMENSION/2;
    }
  
    getNx(): number { return this.x; }
    getNEx(): number { return ; }
    getEx(): number { return this.x + this.radius; }
    getSEx(): number { return ; }
    getSx(): number { return this.x; }
    getSWx(): number { return ; }
    getWx(): number { return this.x - this.radius; }
    getNWx(): number{ return ; }
  
    getNy(): number { return this.y-this.radius; }
    getNEy(): number { return ; }
    getEy(): number { return this.y; }
    getSEy(): number { return ; }
    getSy(): number { return this.y+this.radius; }
    getSWy(): number { return ; }
    getWy(): number { return this.y; }
    getNWy(): number{ return ; }
  
  }
  
  
  export class DiamondWorkflowNode extends WorkflowNode {
  
    constructor(x:number, y: number, public width: number, public height: number ){
      super(nextId(), x,y)
    }
  
    containsPoint(x:number,y:number):boolean{
      let b : boolean = false;
  
      let m = this.y/this.x;
  
      let Y = y-this.y
      let X = x-(this.x-(this.width/2))
  
      if( Y <= m*X ){
        X = x-this.x
        Y = y-(this.y-(this.height/2))
        if( Y >= m*X ){
          m = -m;
          Y = y-this.y
          X = x-(this.x-(this.width/2))
          if( Y >= m*X ){
            X = x-this.x
            Y = y-(this.y+(this.height/2))
            if( Y <= m*X ){
              b = true;
            }
          }
        }
      }
  
      return b;
    }
  
    isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
      let x: Array<number> = Utils.orderValues(x0,x1)
      let y: Array<number> = Utils.orderValues(y0,y1)
      let X = this.x-(this.width/2)
      let Y = this.y-(this.height/2)
      return X >= x[0] && (X+this.width)<=x[1] && Y >= y[0] && (Y+this.height)<=y[1];
    }
  
    resize(direction:Direction,dx:number,dy:number){
      switch(direction){
        case Direction.NORTH:
          this.height = this.height - (2*dy);
          if( this.height < MIN_DIMENSION ){
            this.height = MIN_DIMENSION;
          }
          break;
        case Direction.SOUTH:
          this.height = this.height + (2*dy);
          if( this.height < MIN_DIMENSION ){
            this.height = MIN_DIMENSION;
          } 
          break;
        case Direction.WEST:
          this.width = this.width - (2*dx);
          if( this.width < MIN_DIMENSION ){
            this.width = MIN_DIMENSION;
          } 
          break;
        case Direction.EAST:
          this.width = this.width + (2*dx);
          if( this.width < MIN_DIMENSION ){
            this.width = MIN_DIMENSION;
          } 
          break;
      }
    }
  
    getNx(): number { return this.x; }
    getNEx(): number { return ; }
    getEx(): number { return this.x + (this.width/2); }
    getSEx(): number { return ; }
    getSx(): number { return this.x; }
    getSWx(): number { return ; }
    getWx(): number { return this.x - (this.width/2); }
    getNWx(): number{ return ; }
  
    getNy(): number { return this.y-(this.height/2); }
    getNEy(): number { return ; }
    getEy(): number { return this.y; }
    getSEy(): number { return ; }
    getSy(): number { return this.y+(this.height/2); }
    getSWy(): number { return ; }
    getWy(): number { return this.y; }
    getNWy(): number{ return ; }
  }
  
  export class WorkflowEdge {
    constructor(
      public sourceId:number, 
      public sourceDirection: Direction,
      public targetId: number, 
      public targetDirection: Direction,
      public selected : boolean = true
      ){}
    
    isInsideRect(canvas:WorkflowCanvasComponent,x:number,y:number,x1:number,y1:number):boolean{
      let source = canvas.model.nodes.find(n=>n.id == this.sourceId)
      let target = canvas.model.nodes.find(n=>n.id == this.targetId)
      let x00 = source.getX(this.sourceDirection);
      let y00 = source.getY(this.sourceDirection);
      let x11 = target.getX(this.targetDirection);
      let y11 = target.getY(this.targetDirection);
      return Utils.rectContainsPoint(x,y,x1,y1,x00,y00) && Utils.rectContainsPoint(x,y,x1,y1,x11,y11)
    }

    containsPoint(canvas:WorkflowCanvasComponent,x:number,y:number):boolean{

        let source = canvas.model.nodes.find(n=>n.id == this.sourceId)
        let target = canvas.model.nodes.find(n=>n.id == this.targetId)
        let x0 = source.getX(this.sourceDirection);
        let y0 = source.getY(this.sourceDirection);
        let x1 = target.getX(this.targetDirection);
        let y1 = target.getY(this.targetDirection);

        return this.lineContainsPoint(x0,y0,x1,y1,x,y)
    }

    lineContainsPoint(x0:number,y0:number,x1:number,y1:number,x:number,y:number):boolean{
        
        let d = Utils.distanceFromLine(x0,y0,x1,y1,x,y)

        let xx : Array<number> = Utils.orderValues(x0,x1);
        let yy : Array<number> = Utils.orderValues(y0,y1);

        if(xx[0]==xx[1]){
          console.log("RMD IS VERT LINE")
          xx[0] = xx[0]-2;
          xx[1] = xx[1]+2;
          console.log("RMD ", xx )
        }
        if(yy[0]==yy[1]){
          yy[0] = yy[0]-2;
          yy[1] = yy[1]+2;
        }

        let b = Utils.rectContainsPoint(xx[0],yy[0],xx[1]-xx[0],yy[1]-yy[0],x,y);

      console.log("RMD0", b, d, xx, yy )

        return d<2 && b;
    }
  }