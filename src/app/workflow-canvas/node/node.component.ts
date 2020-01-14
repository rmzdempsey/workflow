import { Component, OnInit, Input } from '@angular/core';
import { Task } from '../workflow-canvas.component';

@Component({
  selector: '[rect-node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class NodeComponent implements OnInit {

  @Input() task : Task;

  constructor() { }

  ngOnInit() {
    
  }
}
