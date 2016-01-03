/**
 * index
 * @author: SimonHao
 * @date:   2016-01-03 13:11:39
 */

'use strict';

import net from 'comm/net';
import * as extend from 'extend';
import base from 'comm/base';
import bind from 'comm/bind';


class Human extends Module{
  constructor(name){
    this._name = name;
  }
  say(){
    this._say = true;
    alert('human say');
  }
}


class Person extends Human{
  constructor(name, age){
    super(name);
    this._age = age;
  }
  say(){
    console.log(super.name);
    super.say();
    alert('person hello');
  }
  get name(){
    return this._name;
  }
  set name(name){
    this._name = name;
  }
  static life(){
    alert('life')
  }
  static get net(){
    alert('net');
  }
}

export default Person;