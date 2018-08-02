/*
	Lazyness

	Copyright (c) 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



function Lazyness( require_ ) {
	this.require = require_ ;
}



// Define a lazy property
Lazyness.property = ( object , name , fn , enumerable ) => {
	Object.defineProperty( object , name , {
		configurable: true ,
		enumerable: !! enumerable ,

		// Must be a function, not =>
		get: function() {
			var value = fn() ;

			Object.defineProperty( object , name , {
				configurable: true ,
				enumerable: !! enumerable ,
				writable: false ,
				value: value
			} ) ;

			return value ;
		}
	} ) ;
} ;

Lazyness.prototype.property = Lazyness.property ;



Lazyness.value = fn => {
	var firstTime = true , value ;

	// Must be a function, not =>
	return function() {
		if ( firstTime ) {
			firstTime = false ;
			value = fn() ;
		}
		return value ;
	} ;
} ;

Lazyness.prototype.value = Lazyness.value ;



Lazyness.prototype.require = function( moduleId ) {
	var firstTime = true , module_ ;

	return new Proxy( ( () => {} ) , {
		apply: ( target , thisArg , args ) => {
			if ( firstTime ) {
				module_ = this.require( moduleId ) ;
				firstTime = false ;
			}

			return Reflect.apply( module_ , thisArg , args ) ;
		} ,
		get: ( target , property ) => {
			if ( firstTime ) {
				module_ = this.require( moduleId ) ;
				firstTime = false ;
			}

			return Reflect.get( module_ , property ) ;
		} ,
		construct: ( target , args ) => {
			if ( firstTime ) {
				module_ = this.require( moduleId ) ;
				firstTime = false ;
			}

			return Reflect.construct( module_ , args ) ;
		}
	} ) ;
} ;

