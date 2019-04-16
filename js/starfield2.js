var start=(function () {

    // console.log('started');

    var starsArray=[];
    var starProp=[
        {size:{min:0.2,max:0.5},
            color:['#333', '#73160f', '#833'],
            speed:{min:0.1,max:0.299}
        },
        {size:{min:0.3,max:0.8},
            color:['#111', '#fff', '#811'],
            speed:{min:0.6,max:1}
        },
        {size:{min:1,max:1.5},
            color:['#fff'],
            speed:{min:0.3,max:1.5}
        },
        {size:{min:0.3,max:2},
            color:['#BBB'],
            speed:{min:0.8,max:1.3}
        },
        {size:{min:0.3,max:1},
            color:['#fff'],
            speed:{min:0.4,max:0.9}
        },
        {size:{min:0.7,max:1.5},
            color:['#fff','#dedede'],
            speed:{min:2,max:3}
        },
        {size:{min:1,max:1.8},
            color:['#ffffff'],
            speed:{min:1,max:2.22}
        },
        {size:{min:0.7,max:1.7},
            color:['#fff', '#888082'],
            speed:{min:0.2,max:1.4}
        }
    ];

    function star(x,y,size,velocity,color) {
        this.x=x;
        this.y=y;
        this.size=size;
        this.velocity=velocity;
        this.color=color
    }


    makeCanvas();

    function makeCanvas() {
        var canvas=document.createElement('canvas');
        canvas.id='can';
        canvas.style.zIndex='-100';
        // console.log(canvas);
        var di =document.getElementById('container');
        di.appendChild(canvas);
        canvas.width=window.innerWidth-10 ;
        canvas.height=window.innerHeight-10;
        // var ctx=canvas.getContext('2d');
        // ctx.fillStyle = '#000';
        // ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        // // canvas.addEventListener('resize',resizeCanvas);
        makeStars();
    }

    function makeStars() {
        // var velocity = {
        //     minVel:100,
        //     maxVel:750
        // };

        var numStars=window.innerHeight/2;

        for(var z=0;z<numStars;z++){
            // var size={
            //     width:Math.floor((Math.random()*3)),
            //     height:Math.ceil((Math.random()*2))
            // };
            // var x=Math.floor(Math.random()*window.innerWidth);
            // var y=Math.floor(Math.random()*window.innerHeight);

            var randStarPropNum=Math.ceil(Math.random()*starProp.length-1);
            var randProp=starProp[randStarPropNum];


            var starSize=randNum(randProp.size.min,randProp.size.min);
            var x=randNum(0,window.innerWidth);
            var y=randNum(0,window.innerWidth);
            var velocity = randNum(randProp.speed.min,randProp.speed.max);
            var color=randProp.color[Math.floor(Math.random()*randProp.color.length-1)];


            var newStar= new star(x,y,starSize,velocity,color);
            starsArray.push(newStar);

            // console.log(starsArray)

        }
        drawStar();

    }


    function drawStar() {
        var canvas=document.getElementById('can');
        var ctx=canvas.getContext('2d');
        ctx.fillStyle='#000';
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

        //	Draw stars.
        for(var xx=0;xx<starsArray.length;xx++){

            ctx.fillStyle = starsArray[xx].color;
            ctx.beginPath();
            ctx.arc(starsArray[xx].x, starsArray[xx].y, starsArray[xx].size, 0, 2*Math.PI, true);
            ctx.fill();
            ctx.closePath();

            // ctx.fillRect(starsArray[xx].x, starsArray[xx].y, starsArray[xx].size.width, starsArray[xx].size.height);
        }
        moveStars()
    }

    function moveStars() {
        for(var i=0;i<starsArray.length;i++){

            var dt=1/60;
            starsArray[i].x-=dt*starsArray[i].velocity*60;

            if(starsArray[i].x<=0){
                var valy =Math.floor(Math.random()*(window.innerHeight));
                var valx =Math.floor(Math.random()*(window.innerWidth));

                starsArray[i].y=valy;
                starsArray[i].x=window.innerWidth;
            }
        }

        requestAnimationFrame(drawStar);

    }

    requestAnimationFrame(drawStar);

    function randNum(min,max) {
        return Math.random()*(Number(max)-Number(min))+Number(min);

    }

    function getRandNum(num) {
        // console.log(num);
        // return Math.floor(Math.random()*(Number(num.maxVel)-Number(num.minVel))+Number(num.minVel));

    }
})();