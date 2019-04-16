(function () {

    var canvas,ctx,player;

    var dt=0,step=1/60,now,last;

    var vbl={
        allImages:{},
        allKeys:{},
        fireCounter:0,
        allFires:[],
        allEnemies:[],
        enemyTotalCounter:0,
        enemyMakeTimer:0,
        isMakeEnemy:true,
        enemyMotionStartTime:0,
        enemyDirectChecker:null,
        enemyDirection:null,
        enemyPatternTimer:0,
        a:null,
        b:null,
        th:null,
        enemySpeed:0,
        allEnemiesFires:[],
        enemyFireTimer:0,
        enemySpriteTime:0,
        allRocks:[],
        rockTimer:0,
        randEnemy:null,
        enemyEndedTime:null,
        randMotion:null,
        playerLifes:3,
        playerScore:0,
        introStateCounter:0,
        playerBlastCounter:0,

    };

    var Delta={
        addEvents:function(){
            document.addEventListener('keydown',chkKeys);
            document.addEventListener('keyup',chkKeys);
            // document.addEventListener('keyup',window.IntroState.update);
        },
        loadImages:function () {
            function loadImg(imgs) {

                var count=imgs.length;
                for(var x=0;x<imgs.length;x++){
                    var img=imgs[x];
                    vbl.allImages[img]=new Image();
                    vbl.allImages[img].addEventListener('load',onload);
                    vbl.allImages[img].src='images/'+img+'.png';
                }


                function onload() {
                    if(--count==0){
                        var game=new Game();
                        game.init();
                    }
                }

            }


            var images=['sprites','bullets','life','sprites2','aliens','rocks','player','blast','rocket'];
            loadImg(images);



        },



    };


    //Initial Things to start game
    canvas=document.getElementById('deltaCanvas');
    ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth-550;
    canvas.height=window.innerHeight-100;
    canvas.style.width=canvas.width;
    canvas.style.height=canvas.height;
    Delta.addEvents();
    Delta.loadImages();





    var Game=function () {


        var that =this;



        that.introState=null;
        that.playState=null;
        that.currentState=null;


        that.chkKeys=function (event) {
            var keys= vbl.allKeys;
            keys[event.keyCode]= event.type==='keydown';
        }

        that.timeStamp=function(){
            return window.performance && window.performance.now()?window.performance.now():new Date().getTime();
        }

        last=that.timeStamp();

        that.frame=function () {


            if(!player){
                player=new Player();
            }

            now=that.timeStamp();
            dt=dt+Math.min(1,(now-last)/1000);

            while (dt>step) {
                that.currentState.update(dt,now);
                dt=dt-step;
            }
            that.currentState.render(dt,now);
            last=now;
            requestAnimationFrame(that.frame);

        }

        that.init=function () {
            that.reset();
            requestAnimationFrame(that.frame);
        }

        that.reset=function () {
            that.enemyMakeInit();
            that.introState= new IntroState(that);
            that.currentState=that.introState;
            that.playState=null;

        }
        that.enemyMakeInit=function (dt,now) {


            //Restoring all variable to default values to make a new enemy

            if(player){

                player.x=canvas.width/7-player.width;
                player.y=canvas.height/2-player.height;
                player.img=vbl.allImages.player;

            }


            vbl.allKeys={};
            vbl.allFires=[];
            vbl.allEnemies=[];
            vbl.allEnemiesFires=[];
            vbl.allRocks=[];
            vbl.playerLifes=3;
            vbl.playerScore=0;
            vbl.randEnemy=null;
            vbl.enemyMakeTimer=0;
            vbl.enemyDirectChecker=null;
            vbl.enemyDirection=null;
            vbl.a=null;
            vbl.b=null;
            vbl.enemySpeed=0;
            vbl.isMakeEnemy=true;
            vbl.enemyEndedTime=null;
            vbl.enemyFireTimer=0;
            vbl.enemySpriteTime=0;
            vbl.enemyPatternTimer=0;
            vbl.enemyTotalCounter=0;
            vbl.randMotion=null;

            if(vbl.randEnemy===null ||vbl.randEnemy===undefined ){
                vbl.randEnemy=Math.floor(Math.random()*3);
            }

        }






        that.startGame=function () {
            that.playState=new playState(that);
            that.currentState=that.playState;
            this.introState=null;
        }


    }




    var IntroState =function (game) {

        this.update=function () {

            vbl.introStateCounter+=0.13;

            if(vbl.introStateCounter>6){

                for(x in vbl.allKeys){
                    if(vbl.allKeys[x]){
                        vbl.introStateCounter=0;
                        last=game.timeStamp();
                        game.startGame();
                    }
                }

            }

        }



        this.render=function () {
            // ctx.fillStyle = '#f71700';

            var text='Press any Key to Start the Game';
            ctx.font = '48px Corbel';
            ctx.fillStyle='white' ;
            ctx.fillText(text, 110, canvas.height/2);


        }
    }

    function chkKeys(event) {
        var keys= vbl.allKeys;
        keys[event.keyCode]= event.type==='keydown';
    }

    var playState=function(game){

        var that=this;

        that.update=function (dt,now) {
            that.choseMotionPattern();

            that.scoreAndLife();
            that.checkToEndGame(game);
            that.updatePlayer(dt);
            that.movePlayer(dt);

            that.fire(dt);
            that.updateFire(dt);

            that.enemyMakeInit(dt,now);


            that.makeEnemy(dt,now);
            that.updateEnemy(dt,now);

            that.enemyFires(dt,now);
            that.updateEnemyFires(dt,now);



            that.makeRocks(dt,now);
            that.updateRocks(dt,now);

            that.detectCollion();
            that.playerShooted();


        }

        that.render=function (dt,now) {
            ctx.clearRect(0,0,canvas.width,canvas.height);       //Clear Whole canvas to make new frame


            //Drawing Player
            ctx.drawImage(player.img,player.xFrame*player.frameWidth,player.yFrame*player.frameHeight,player.width,player.height,player.x,player.y,player.width*1.5,player.height*1.5);



            //Draw Player's Rocket
            if(vbl.allKeys[37] ||vbl.allKeys[38] ||vbl.allKeys[39] ||vbl.allKeys[40] ){

                ctx.drawImage(vbl.allImages.rocket,player.rocketXFrame*player.rocketWidth,player.rocketYFrame*player.rocketHeight,player.rocketWidth,player.rocketHeight,player.x-player.width*1.5,player.y-1,player.rocketWidth*1.5,player.rocketHeight);

            }




            //Draw Fires of Player
            for(var i=0;i<vbl.allFires.length;i++){
                var fire= vbl.allFires[i];
                ctx.drawImage(vbl.allImages.bullets,fire.xFrame,fire.yFrame,fire.size,fire.size,fire.x,fire.y,fire.size,fire.size);
            }



            //Draw Rocks

            for(var i=0;i<vbl.allRocks.length;i++){
                var rock=vbl.allRocks[i];

                ctx.drawImage(vbl.allImages.rocks,rock.xFrame*rock.frameWidth,rock.yFrame*rock.frameHeight,rock.frameWidth,rock.frameHeight,rock.x,rock.y,rock.frameWidth*1.7,rock.frameHeight*1.7);

            }


            //Draw Enemy
            for(var i=0;i<vbl.allEnemies.length;i++){
                var en=vbl.allEnemies[i];

                if(vbl.randEnemy===0 && en.img.height>90 ){
                    mult=1.55;
                }else         var mult=1;

                ctx.drawImage(en.img,en.xFrame*en.frameWidth,en.yFrame*en.frameHeight,en.frameWidth,en.frameHeight,en.x,en.y,en.frameWidth*mult,en.frameHeight*mult);
            }


            // Draw Fires of Enemy
            for(var i=0;i<vbl.allEnemiesFires.length;i++){
                var fire= vbl.allEnemiesFires[i];

                ctx.drawImage(vbl.allImages.bullets,fire.xFrame*fire.frameSize,fire.yFrame*fire.frameSize,fire.size,fire.size,fire.x,fire.y,fire.size,fire.size);
            }

        }



//============================================Helper Function=======================================================


        that.scoreAndLife=function () {
            var score=document.getElementById('score');
            var life=document.getElementById('life');
            life.innerText='Life: '+vbl.playerLifes;
            score.innerText='Score: '+vbl.playerScore;

        }



        that.checkToEndGame=function (game) {
            if(vbl.playerLifes==0){
                game.reset();
            }

        }



        that.updatePlayer=function (dt) {


            player.playerSpriteTimer+=dt;
            if(player.playerSpriteTimer>0.145){
                player.xFrame++;
                player.rocketXFrame++;
                if(player.xFrame>4){
                    player.xFrame=0;
                }
                if(player.rocketXFrame>1){
                    player.rocketXFrame=0;
                }
                player.playerSpriteTimer=0;
            }

        }




        that.movePlayer=function (dt) {
            player.moveCounter+=dt;
            var keys= vbl.allKeys;
            if(player.moveCounter>0.035){


                if(keys[39]){
                    player.x+=10;
                }
                if(keys[37]){
                    player.x-=10;
                }
                if(keys[38]){
                    player.y-=10;
                }
                if(keys[40]){
                    player.y+=10;
                }
                player.moveCounter=0;
            }

            player.x=Math.max(0,Math.min(player.x,canvas.width-player.width));
            player.y=Math.max(0,Math.min(player.y,canvas.height-player.height))

        }

        that.fire=function (dt) {
            vbl.fireCounter+=dt;

            if(vbl.fireCounter>0.34){
                if(vbl.allFires.length<8){

                    if(vbl.allKeys[17]){
                        var fire=new Fire();
                        fire.x=player.x+28;
                        fire.y=player.y+3.5;
                        vbl.allFires.push(fire);
                    }
                }
                vbl.fireCounter=0;
            }
        }

        that.updateFire=function (dt) {

            for(var i=0;i<vbl.allFires.length;i++){
                var fire=vbl.allFires[i];
                fire.x+=9;

                if(vbl.fireCounter>0.01) {
                    fire.xFrame=fire.xFrame+14;
                    if(fire.xFrame>=28){
                        fire.xFrame=0;
                    }

                }
                if(fire.x>=canvas.width){
                    vbl.allFires.splice(i,1);
                }

            }
        }

        that.choseMotionPattern=function () {
            if(!vbl.randMotion){
                vbl.randMotion=Math.floor(Math.random()*8);

            }
        }


        that.makeEnemy=function (dt,now) {

            if(vbl.randEnemy==null ||vbl.randEnemy==undefined ){
                vbl.randEnemy=Math.floor(Math.random()*3);
            }

            vbl.enemyMakeTimer+=0.01;

            if(vbl.enemyMakeTimer>0.15){
                if(vbl.allEnemies.length<7 && vbl.isMakeEnemy && vbl.enemyTotalCounter<7){

                    if(vbl.allEnemies.length<1){


                        var en =new Enemy(now);
                        en=that.setupEnemySpriteSheet(en);

                        en.initY=en.y;
                        en.initWaveY=en.initY;

                        en.stopZigZag=Math.floor(Math.random()*8)+4;

                        that.setWaveRange(en);

                        vbl.allEnemies.push(en);
                    }else {

                        var en =new Enemy(now);

                        en.initWaveY=vbl.allEnemies[0].initY;

                        en.y=vbl.allEnemies[vbl.allEnemies.length-1].initY;
                        en.initY=vbl.allEnemies[vbl.allEnemies.length-1].initY;

                        //For Zig Zag Motion
                        en.stopZigZag=vbl.allEnemies[0].stopZigZag;
                        en.stopRight=vbl.allEnemies[0].stopRight;
                        en.rightInc=vbl.allEnemies[0].rightInc;


                        //For Daigonal Motion

                        en.daigonalRange=vbl.allEnemies[0].daigonalRange;

                        //Spritesheet work

                        en=that.setupEnemySpriteSheet(en);


                        //Angle For Circular Motion

                        vbl.enemyMotionStartTime=null;

                        if( vbl.enemyTotalCounter==6){
                            vbl.enemyMotionStartTime=Math.random()+0.1;
                            if(vbl.enemyMotionStartTime<0.2)vbl.enemyMotionStartTime+=0.1;
                            if(vbl.enemyMotionStartTime>0.6)vbl.enemyMotionStartTime-=0.1;
                            if(vbl.enemyMotionStartTime>0.75)vbl.enemyMotionStartTime-=0.2;

                        }

                        //for wave Motion

                        en.waveRange=vbl.allEnemies[0].waveRange;



                        vbl.allEnemies.push(en);
                    }

                    vbl.enemyTotalCounter++;
                }

                if(vbl.allEnemies.length>=7 || vbl.enemyTotalCounter>=7){
                    vbl.isMakeEnemy=false;
                }

                vbl.enemyMakeTimer=0;
            }

        }



        that.setupEnemySpriteSheet=function (en) {
            if(vbl.randEnemy===0){
                en.yFrame=0;
            }else if(vbl.randEnemy===1){
                en.yFrame=1;
                en.frameHeight=32;
                en.frameWidth=34;
            }else if(vbl.randEnemy==2){
                en.yFrame=2;
                en.frameHeight=32;
                en.frameWidth=34;
            }
            return en;
        }

        that.setWaveRange=function (en) {

            if(en.initY-160>40 && en.initY+160<canvas.height-60)en.waveRange=3.4;

            else if(en.initY-100>40 && en.initY+100<canvas.height-60)en.waveRange=3;
            else if(en.initY-70>40 && en.initY+70<canvas.height-60)en.waveRange=2;

        }


        that.updateEnemy=function (dt,now) {

            vbl.enemySpeed+=0.018;
            if(vbl.enemyMotionStartTime && vbl.allEnemies[vbl.allEnemies.length-1])
                var time=((now-vbl.allEnemies[vbl.allEnemies.length-1].initTime)/1000);





            // ========================Zig-Zag Motion=========================



            if(vbl.randMotion==1 || vbl.randMotion==0){
                if(vbl.enemySpeed>0.0176){
                    vbl.enemyDirection='zigzag';
                    that.zigZagMotion(dt,now);
                    vbl.enemySpeed=0;
                }
            }


            //====================Straight Motion=============================

            if(vbl.randMotion==2){
                for(var i=0;i<vbl.allEnemies.length;i++){
                    vbl.enemyDirection='straight';
                    var en=vbl.allEnemies[i];
                    en.x-=5;
                }
            }



            //=====================Wave Motion=================================
            if(vbl.randMotion==3) {

                if(vbl.enemySpeed>0.01){
                    vbl.enemyDirection='wave';
                    that.waveMotion();
                    vbl.enemySpeed=0;
                }
            }

            //========================Circular Motion Condition=========================


            if(vbl.randMotion==4){
                if(vbl.allEnemies[0] && time>vbl.enemyMotionStartTime && vbl.allEnemies[vbl.allEnemies.length-1].totalRot<1){
                    var radius=100;
                    if(vbl.enemySpeed>0.01){

                        //Configure Enemy One Center Coordinates
                        that.confgEnemyCenter(vbl.allEnemies);

                        if(!vbl.enemyDirectChecker) vbl.enemyDirection=that.cMotionDirect(radius,vbl.allEnemies[0].y);

                        //Adding Angle(theta) in all Enemies according to direction of circular motion
                        that.confgEnemyAngle(vbl.allEnemies);

                        vbl.enemyDirectChecker=true;


                        if(vbl.enemyDirection){
                            that.circularMotion(vbl.allEnemies,vbl.a,vbl.b,radius,vbl.enemyDirection);
                        }else {
                            vbl.allEnemies[vbl.allEnemies.length-1].totalRot=1;
                        }
                        vbl.enemySpeed=0;
                    }
                }else{                              //Straight Motion
                    for(var i=0;i<vbl.allEnemies.length;i++){
                        var en=vbl.allEnemies[i];
                        en.x-=3.8;
                    }
                }



            }

            //=====================Daigonal-Motion=======================

            if(vbl.randMotion==5) {

                if (vbl.enemySpeed > 0.01) {
                    vbl.enemyDirectChecker = true;
                    vbl.enemyDirection = 'daigonal';
                    that.daigonalMotion();
                    vbl.enemySpeed = 0;
                }
            }

            //====================Random-Motion=======================
            if(vbl.randMotion==6) {
                if(vbl.enemySpeed>0.01){
                    vbl.enemyDirectChecker=true;
                    vbl.enemyDirection='random';
                    that.randomMotion();
                    vbl.enemySpeed=0;
                }
            }

            //==============================V-Motion==================================
            if(vbl.randMotion==7) {

                if(vbl.enemySpeed>0.01){
                    vbl.enemyDirectChecker=true;
                    vbl.enemyDirection='vmotion';
                    that.vMotion();
                    vbl.enemySpeed=0;
                }

            }

            //Removing Enemies that are off the canvas
            that.removeOffsetEnemies();

            //  Changing SpirteSheet of Enemy One
            that.updateEnemySprite(dt);

            //Remove all Dead Enemies that hit by Player's fire

            that.removeDeadEnemies();



        }

        that.removeOffsetEnemies=function () {
            for(var i=0;i<vbl.allEnemies.length;i++){
                var en=vbl.allEnemies[i];
                if(en.x<=0){
                    vbl.allEnemies.splice(i,1);
                }
                if(vbl.allEnemies.length<1){
                    vbl.isMakeEnemy=true;
                    vbl.enemyEndedTime=now;

                }
            }
        }

        that.updateEnemySprite=function (dt) {
            vbl.enemySpriteTime+=dt;
            if(vbl.enemySpriteTime>0.13 ){
                for(var i=0;i<vbl.allEnemies.length;i++){
                    var en=vbl.allEnemies[i];
                    en.xFrame++;
                    if(en.xFrame===5){
                        en.xFrame=0;
                    }
                    if(en.isBlast){
                        en.blastCounter+=dt;
                        if(en.blastCounter>0.08){
                            en.isDead=true;
                            en.isBlast=false;
                        }
                    }
                }
                vbl.enemySpriteTime=0;
            }
        }

        that.removeDeadEnemies=function () {
            for(var i=0;i<vbl.allEnemies.length;i++){
                var enemy=vbl.allEnemies[i];
                if(enemy.isDead)vbl.allEnemies.splice(i,1);

                if(vbl.allEnemies.length<1){
                    vbl.isMakeEnemy=true;
                    vbl.enemyEndedTime=now;

                }
            }
        }



        that.enemyFires=function (dt) {
            vbl.enemyFireTimer+=dt;

            if(vbl.enemyFireTimer>(Math.random())+0.7){

                if (vbl.allEnemies[0] && vbl.allEnemies[0].x > 40) {

                    if( vbl.allEnemiesFires.length<=3){

                        var f = new Fire();

                        if(vbl.enemyDirection){
                            var rand=Math.floor(Math.random()*vbl.allEnemies.length);
                            f.x = vbl.allEnemies[rand].x;
                            f.y=vbl.allEnemies[rand].y;
                        }else {
                            f.x = vbl.allEnemies[0].x;
                            f.y=vbl.allEnemies[0].y;
                        }

                        f.yFrame = 1;
                        f.xFrame=0;
                        vbl.allEnemiesFires.push(f);

                    }

                }
                vbl.enemyFireTimer=Math.random()*0.2;

            }



        }


        that.updateEnemyFires=function (dt) {

            for(var i=0;i<vbl.allEnemiesFires.length;i++){
                var fire=vbl.allEnemiesFires[i];
                fire.x-=8;
                if(vbl.enemyDirection=='straight' && fire.rand<0.6){
                    fire.y-=1;
                }

                if(vbl.fireCounter>0.05) {
                    fire.xFrame++;
                    if(fire.xFrame>=3){
                        fire.xFrame=0;
                    }

                }

                if(fire.x<=0){
                    vbl.allEnemiesFires.splice(i,1);
                }

            }

        }


    //restore variables to start making enemies again
        that.enemyMakeInit=function (dt,now) {

            if(vbl.enemyEndedTime)
                if((now-vbl.enemyEndedTime)/100>0.5){

                    //Restoring all variable to default values to make a new enemy
                    vbl.randEnemy=null;
                    vbl.enemyMakeTimer=0;
                    vbl.enemyDirectChecker=null;
                    vbl.enemyDirection=null;
                    vbl.a=null;
                    vbl.b=null;
                    vbl.enemySpeed=0;
                    vbl.isMakeEnemy=true;
                    vbl.enemyEndedTime=null;
                    vbl.enemyFireTimer=0;
                    vbl.enemySpriteTime=0;
                    vbl.enemyPatternTimer=0;
                    vbl.enemyTotalCounter=0;
                    vbl.randMotion=null;

                    // if(vbl.randEnemy===null ||vbl.randEnemy===undefined ){
                    //     vbl.randEnemy=Math.floor(Math.random()*3);
                    // }

                }


        }


        that.makeRocks=function (dt,now) {

            if(vbl.enemyDirectChecker &&(vbl.enemyDirection!='daigonal')){
                vbl.rockTimer+=dt;
                var lastEnemy=vbl.allEnemies[vbl.allEnemies.length-1];

                if(vbl.allRocks.length<6 ){

                    if(vbl.rockTimer>1){

                        var rock= new Rock();


                        rock.xFrame=Math.floor(Math.random()*4);
                        rock.yFrame=Math.floor(Math.random()*2);
                        if(rock.yFrame===0){
                            rock.y=0;
                        }else {
                            rock.y=canvas.height-rock.frameHeight*1.7;
                        }




                        vbl.allRocks.push(rock);
                        vbl.rockTimer=Math.abs(Math.random()-0.4);

                    }
                }

            }

        }


        that.updateRocks=function () {
            for (var i=0;i<vbl.allRocks.length;i++){
                var rock=vbl.allRocks[i];
                rock.x-=2.5;
                // rock.y+=1;
                if(rock.x<=0-rock.frameWidth*2){
                    vbl.allRocks.splice(i,1);
                }
            }

        }





        that.detectCollion=function () {

            for(var i=0;i<vbl.allEnemies.length;i++) {
                var en = vbl.allEnemies[i];
                var ex = en.x;
                var ey = en.y;
                var ew = en.frameWidth;
                var eh = en.frameHeight;
                if(vbl.randEnemy==0){
                    eh*=1.55;
                    ew*=1.55;
                }

                //Player's Bullet and Enemy Collion Detection

                for (var z = 0; z < vbl.allFires.length; z++) {
                    var bul = vbl.allFires[z];

                    if ((bul.x + bul.size > ex && bul.x < ex + ew) &&
                        (bul.y + bul.size > ey && bul.y < ey + eh)) {

                        vbl.playerScore+=20;

                        that.handleEnemyCollion(z,i);

                        vbl.allFires.splice(z, 1);
                        // vbl.allEnemies.splice(i, 1);



                        if(vbl.allEnemies.length<1){
                            vbl.enemyEndedTime=now;
                            vbl.isMakeEnemy=true;
                        }
                    }

                }

                //Player and Enemy Collion Detection

                if ((player.x + player.width > ex &&  player.x < ex + ew) &&
                    (player.y + player.height > ey &&  player.y < ey + eh)) {

                    if(!player.isBlast){
                        vbl.playerLifes--;
                        player.isAlive=false;
                        player.isBlast=true;
                    }
                    vbl.allEnemies.splice(i, 1);
                    //if all Enemies are Ended start making new enemies
                    if(vbl.allEnemies.length<1){
                        vbl.enemyEndedTime=now;
                        vbl.isMakeEnemy=true;
                    }
                }
            }


            //Player and Rock Colion Detection

            for(var a=0;a<vbl.allRocks.length;a++){
                var rock=vbl.allRocks[a];
                var rx=rock.x;
                var ry=rock.y;
                var rw=rock.frameWidth*1.6;
                var rh=rock.frameHeight*1.55;

                if ((player.x + player.width > rx &&  player.x < rx + rw) &&
                    (player.y + player.height > ry &&  player.y < ry + rh)) {


                    if(!player.isBlast){
                        vbl.playerLifes--;
                        player.isAlive=false;
                        player.isBlast=true;
                    }

                    if(rock.y===0){
                        player.x-=10;
                        player.y+=10;

                    }
                    if(!(rock.y===0)){
                        player.x-=10;
                        player.y-=10;

                    }
                }



            }



            //Enemy's Bullet and player Collion Detection

            for (var z = 0; z < vbl.allEnemiesFires.length; z++) {
                var bul = vbl.allEnemiesFires[z];
                if ((bul.x + bul.size > player.x && bul.x < player.x+player.width) &&
                    (bul.y + bul.size > player.y && bul.y < player.y + player.height)) {

                    if(!player.isBlast){
                        vbl.playerLifes--;
                        player.isAlive=false;
                        player.isBlast=true;
                    }

                    vbl.allEnemiesFires.splice(z, 1);
                    player.x-=10;
                    player.y-=10;
                }

            }



        }



        that.handleEnemyCollion=function (fireInd,enemyInd) {

            vbl.allEnemies[enemyInd].img=vbl.allImages.blast;
            vbl.allEnemies[enemyInd].yFrame=0;

            vbl.allEnemies[enemyInd].frameWidth = 33;
            vbl.allEnemies[enemyInd].frameHeight = 33;

            vbl.allEnemies[enemyInd].isAlive=false;
            vbl.allEnemies[enemyInd].isBlast=true;

            // vbl.allEnemies.splice(enemyInd,1);
        }


        that.playerShooted=function(){


            if(player.isBlast){
                vbl.playerBlastCounter+=0.1;
                player.img=vbl.allImages.blast;

                player.yFrame=0;

                player.height=33;
                player.width=28;
                player.frameWidth =28;
                player.frameHeight =0;

                player.rocketWidth=1;
                player.rocketHeight=1;

                var time =3.5;
                if(vbl.playerLifes==0)time=0;

                if(vbl.playerBlastCounter>time){

                    player.height=18;
                    player.width=33;
                    player.frameWidth=33.2;
                    player.frameHeight=18;




                    player.isBlast=false;
                    player.isAlive=true;
                    player.img=vbl.allImages.player;
                    vbl.allEnemies=[];
                    vbl.allEnemiesFires=[];


                    vbl.randEnemy=null;
                    vbl.enemyEndedTime=now;
                    vbl.isMakeEnemy=true;
                    vbl.playerBlastCounter=0;
                }
            }
        }

//=======================================All Motion Patterns============================================================


//-----------------------------------Straight Motion Pattern----------------------------------------------
        that.straightMotion=function (en) {

            if(arguments.length>0){
                en.x-=3;
            }else if(arguments.length==0){
                vbl.enemyDirection='straight';

                for(var i=0;i<vbl.allEnemies.length;i++){
                    var en=vbl.allEnemies[i];
                    en.x-=3;
                }
            }
        }



//-------------------------------------------Circular Motion Pattern--------------------------------------------

        that.circularMotion=function (enemies,a,b,radius,direct) {


            for(var i=0;i<enemies.length;i++){
                var enemy=enemies[i];

                //configuration of enemies
                if(i===0 && enemy.cMotionX===0){
                    that.confgCMotionValues();
                }

                if(enemy.totalRot<1){          //run if circulr motion has not completed one complete rotation

                    if(enemy.x>enemy.cMotionX && !enemy.enemyC){       //if enemy is not reached on first enemy
                        enemy.x-=5;                                    // x-positon,it will not start

                    }else{                                  //if enemy is reached on first enemy x-positon,it will  start circular motion

                        if(direct=='clockwise'){
                            that.clockwiseCirularMotion(enemies,i,a,b,radius);
                        }

                        //For anti-ClockWise Motion
                        if(direct=='anticlockwise'){
                            that.antiClockwiseCircularMotion(enemies,i,a,b,radius);
                        }

                    }

                }else {   //if rotaion is completed of enemy
                    enemy.x-=5;
                }
            }


        }


        that.confgCMotionValues=function () {
            for (var i = 0; i < vbl.allEnemies.length; i++) {
                var enemy=vbl.allEnemies[i];
                if(i==0){
                    enemy.cMotionX=enemy.x;        //cMotionX= x coordinate from where circular motion started
                    enemy.initTH=enemy.th;        //initTH=initial angle(theta) with which circular motion started

                }else if(i>0){
                    enemy.cMotionX=vbl.allEnemies[0].cMotionX;
                    enemy.initTH=vbl.allEnemies[0].initTH;
                }

            }
        }

        that.clockwiseCirularMotion=function (enemies,i,a,b,radius) {
            var enemy=enemies[i];

            // Conf x and y coordinated of enemy

            enemy.x=a+((radius*Math.cos(Math.PI*enemy.th)));
            enemy.y=b+((radius*Math.sin(Math.PI*enemy.th)));
            enemy.enemyC=true;


            //Config angle
            enemy.th+=enemy.thInc;
            if(enemy.th>=2){
                enemy.th=0;
            }

            //Checking Completion of rotation
            if(enemy.th>enemies[0].initTH && enemy.th<enemies[0].initTH+enemy.thInc){
                enemy.totalRot++;
            }

        }

        that.antiClockwiseCircularMotion=function (enemies,i,a,b,radius) {

            var enemy=enemies[i];

            enemy.x=a+((radius*Math.sin(Math.PI*enemy.th)));
            enemy.y=b+((radius*Math.cos(Math.PI*enemy.th)));
            enemy.enemyC=true;

            //Config angle
            enemy.th+=enemy.thInc;
            if(enemy.th>=2){
                enemy.th=0;
            }

            //Checking Completion of rotation
            if(enemy.th>enemies[0].initTH && enemy.th<enemies[0].initTH+enemy.thInc){
                enemy.totalRot++;
            }

        }

//----------------Circular Motion Direction >> Clockwise or anti-Clockwise------------------

        that.cMotionDirect=function (radius,yEnemy) {

            if(vbl.allRocks[0])
                var rockHeight=vbl.allRocks[0].frameHeight*2+40;
            else rockHeight=0;

            if(yEnemy-radius>rockHeight)return "clockwise";

            rockHeight=canvas.height-rockHeight;
            if(yEnemy+radius<rockHeight)return "anticlockwise";

        }

        that.confgEnemyAngle=function (enemy) {
            if(vbl.enemyDirection && !vbl.enemyDirectChecker ){
                for(var a=0;a<enemy.length;a++){
                    var en=enemy[a];
                    if(vbl.enemyDirection==="clockwise")
                        en.th=1;             //1 for clockwise motion and 1.5 for anti-clockwise motion
                    if(vbl.enemyDirection==="anticlockwise")
                        en.th=1.5;
                }
            }
        }


//==========Configure Center of circle for Circular motion of Enemies==============

        that.confgEnemyCenter=function (enemy) {
            if(!vbl.a && !vbl.b){
                vbl.a=enemy[0].x+50;
                vbl.b=enemy[0].y;
            }
        }


//===================================Zig Zag Motion Pattern================

        that.zigZagMotion=function (dt,now) {


            for (var i = 0; i < vbl.allEnemies.length; i++) {

                var enemy = vbl.allEnemies[i];

                if (enemy.direction === 'right') {
                    that.zigzagMotionRight(enemy);
                } else if (enemy.direction === 'up') {
                    that.zigzagMotionUp(enemy, i);
                } else if (enemy.direction === 'down') {
                    that.zigzagMotionDown(enemy, i);
                } else if (enemy.direction === 'straight') {
                    that.straightMotion(enemy);
                }


                if (enemy.directChangeCounter > enemy.stopZigZag) {

                    enemy.direction = 'straight';

                }
            }

        }

        that.zigzagMotionRight=function (en) {
            en.x-=3;

            if(en.rightCount<1 && en.directChangeCounter<1){
                en.rightCount+=en.rightInc;
            }else {
                en.rightCount+=en.rightInc-0.1;


                //Stoping motion in right direction and changing to other direction when right counter reached limit
                if(en.rightCount>en.stopRight){

                    en.directChangeCounter++;

                    if(en.directChangeCounter%4===0){
                        en.direction='down';
                    }else if(en.directChangeCounter%4!==0){
                        en.direction='up';
                    }

                    en.rightCount=0;
                }
            }
        }

        that.zigzagMotionUp=function (en,i) {

            en.y-=4;

            if(that.checkRocks(20,en.y)){
                en.directChangeCounter++;
                en.direction='right';
            }
        }

        that.zigzagMotionDown=function (en,i) {
            en.y+=4;

            if(that.checkRocks(20,en.y)){
                en.directChangeCounter++;
                en.direction='right';
            }
        }


//=====================================Wave Motion Pattern==============================


        that.waveMotion=function () {

            for(var i=0;i<vbl.allEnemies.length;i++){
                var en=vbl.allEnemies[i];
                en.x-=3.5;
                en.initWaveY=en.initWaveY+Math.sin(en.th)*en.waveRange;
//         en.initWaveY=en.initWaveY+Math.sin(en.th)*2;
                en.y=en.initWaveY;
                en.th+=0.055;
            }



        }


//========================Daigonal-Motion=========================



        that.daigonalMotion=function (enemy) {


            for(var i=0;i<vbl.allEnemies.length;i++) {

                var en=vbl.allEnemies[i];
                if(arguments.length==0){
                    if(en.y<100 && vbl.allRocks.length>0){
                        that.straightMotion(en);
                        en.direction='straight';
                    }else {

                        en.x-=6;
                        en.y=en.x-en.daigonalRange;
                    }
                }



            }

            if(arguments.length==1){
                enemy.x-=3.4;
                enemy.y-=2;

            }
        }






//====================================Random-Motion-Pattern===================================




        that.randomMotion=function () {

            for(var i=0;i<vbl.allEnemies.length;i++){
                var enemy=vbl.allEnemies[i];

                if(enemy.direction==='left'){
                    that.randomMotionLeft(enemy);
                }else if(enemy.direction==='right'){
                    that.randomMotionRight(enemy);
                }else if(enemy.direction==='up'){
                    that.randomMotionUp(enemy,i);
                }else if(enemy.direction==='daigonal'){
                    that.randomMotionDaigonal(enemy);
                }
            }
        }

        that.randomMotionRight=function (en) {
            en.x-=5;

            if(en.rightCount<1 && en.directChangeCounter<1){
                en.rightCount+=en.rightInc;
            }else if(en.directChangeCounter<5){
                en.rightCount+=en.rightInc-0.2;


                //Stoping motion in left direction and changing to other direction when left counter reached limit
                if(en.rightCount>en.stopRight){
                    en.rightCount=0;
                    en.directChangeCounter++;


                    if(vbl.enemyDirection=='vmotion' && en.directChangeCounter==2)            en.direction='daigonaldown';
                    else if(vbl.enemyDirection=='vmotion' && en.directChangeCounter>3)            en.direction='right';
                    else      en.direction='up';

                }
            }

        }


        that.randomMotionLeft=function (en) {
            en.x+=5;
            if(en.x>canvas.width-90) {
                en.directChangeCounter++;

                en.direction = 'up';
            }


        }

        that.randomMotionUp=function (en) {
            en.y-=5;

            if(that.checkRocks(20,en.y)){
                if(en.directChangeCounter==2){
                    en.direction='daigonal';
                    en.directChangeCounter++;

                }else if(en.directChangeCounter==5){
                    en.direction='right';
                    en.directChangeCounter++;``

                }

            }

        }



        that.randomMotionDaigonal=function (en,dir) {

            en.x-=4;
            en.y+=2;




            if(en.x<en.stopDaigonal || en.y>canvas.height-100){
                en.directChangeCounter++;
                en.direction='left';
            }
        }

//==========================================V-Motion Pattern=======================================


        that.vMotion=function (){

            for(var i=0;i<vbl.allEnemies.length;i++) {
                var enemy = vbl.allEnemies[i];

                if(enemy.direction==='right'){
                    that.randomMotionRight(enemy);
                }else  if(enemy.direction==='daigonalup'){
                    that.vMotionDaigonalUp(enemy);
                }else if(enemy.direction==='daigonaldown'){
                    that.vMotionDaigonalDown(enemy);
                }
            }
        }


        that.vMotionDaigonalUp=function (en) {

            en.x-=5;
            en.y-=5;

            if(!(!(that.checkRocks(20,en.y)) && en.y>en.initY)) {
                en.directChangeCounter++;
                en.direction = 'right';
            }

        }

        that.vMotionDaigonalDown=function (en) {
            en.x-=5;
            en.y+=5;

            if(!(!(that.checkRocks(20,en.y)) && en.y<en.initY+120)){
                en.directChangeCounter++;
                en.direction='daigonalup';
            }

        }





        //Checking if rocks are present or not
        that.checkRocks=function (d, y) {

            if(y-d<64||y+d>canvas.height-64){           //Height of Rocks =64
                return true;
            }

            return false;
        }


    }







//==========================Constructor Functions==============================

    var Player=function () {
        this.height=18;
        this.width=33;
        this.x=canvas.width/7-this.width;
        this.y=canvas.height/2-this.height;

        this.life=3;
        this.img=vbl.allImages.player;
        this.xFrame=0;      //from 3 to 7
        this.yFrame=0;
        this.frameWidth=33.2;
        this.frameHeight=18;





        this.rocketXFrame=0;
        this.rocketYFrame=0;
        this.rocketWidth=33;
        this.rocketHeight=31;


        this.playerSpriteTimer=0;
        this.moveCounter=0;


        this.isPlayerAlive=true;
        this.isPlayerBlast=false;
        this.isPlayerDead=false;



    };


    var Fire=function(){
        this.x=0;
        this.y=0;
        this.size=14;

        this.xFrame=0;
        this.yFrame=0;
        this.frameSize=14;
        this.rand=Math.random();


    };


    var Enemy =function (now) {

        this.img=vbl.allImages.aliens;
        this.x=canvas.width;
        this.y=(Math.random()*((canvas.height-130)-130))+120;
        this.initY=0;
        this.isAlive=true;
        this.isBlast=false;
        this.blastCounter=0;
        this.isDead=false;


        //For Circular Motion
        this.th=0;              //angle value will be given when enemy will be created
        this.cMotionX=0;         //keeps x coordinate from where enemy started circular motion
        this.enemyC=false;        //Started circular motion or Not
        this.totalRot=0;        //total circular rotations completed
        this.initTH=0;          //initial angle when circular motion is started
        this.thInc=0.018;        //Increament in angle



        //For Zig-Zag Motion Pattern


        this.direction='right';
        this.rightCount=0;
        this.rightInc=(Math.random()*0.3)+0.4;
        this.directChangeCounter=1;
        this.stopZigZag=0;
        this.stopRight=Math.floor(Math.random()*10)+7;



        //For Wave-Motion
        this.initWaveY=0;
        this.waveRange=2;


        //For Daigonal Motion

        this.daigonalRange=(Math.random()*(300-100))+100;


        //for random motion pattern
        this.daigonalCounter=0;
        this.stopDaigonal=40;

        //For SpritSheet
        this.xFrame=1;
        this.yFrame=0;
        this.frameWidth=17;
        this.frameHeight=17;


        this.initTime=now ;
    };


    var Rock=function (){
        this.x=canvas.width;
        this.y=0;

        this.xFrame=0;
        this.yFrame=0;
        this.frameWidth=65;
        this.frameHeight=32;

    };

})();