﻿/// <reference path="./../declarations.ts"/>

class Entity implements iRenderable {
    public id: number;

    public x: number = 0;
    public y: number = 0;
    public xSpeed: number = 0;
    public ySpeed: number = 0;
    public width: number = 0;
    public height: number = 0;
    public onGround: boolean = false;

    public room: GameRoom;
    public hasGravity: boolean = false;
    public color: string;

    // Constants
    public static GRAVITY: number = 100;
    public static MAX_SPEED: number = 100;

    constructor(id: number, room: GameRoom, data: DataView) {
        this.id = id;
        this.room = room;
        this.update(data);
    }

    public step(timeScale: number): void {
        if (this.hasGravity) {
            this.ySpeed = Math.min(this.ySpeed + Entity.GRAVITY * timeScale, Entity.MAX_SPEED);
        }

        this.onGround = false;
        this.x += this.xSpeed * timeScale;
        this.HandleCollision(true);
        this.y += this.ySpeed * timeScale;
        this.HandleCollision(false);
    }

    public update(data: DataView) {
        var offset = 4; // To compensate for LENGTH, ID and TYPE
        this.x = data.getInt16(offset, true);
        offset += 2;
        this.y = data.getInt16(offset, true);
        offset += 2;

        this.xSpeed = data.getFloat32(offset, true);
        offset += 4;
        this.ySpeed = data.getFloat32(offset, true);
        offset += 4;
    }

    private HandleCollision(x: boolean) {
        var speed: Number = x ? this.xSpeed : this.ySpeed;

        var collisionTiles: Tile[] = [];

        collisionTiles.push(this.room.map.getTileAt(this.x - this.width * 0.5 + 0.3, this.y - this.height * 0.5 + 0.3));
        collisionTiles.push(this.room.map.getTileAt(this.x + this.width * 0.5 - 0.3, this.y - this.height * 0.5 + 0.3));
        collisionTiles.push(this.room.map.getTileAt(this.x - this.width * 0.5 + 0.3, this.y + this.height * 0.5 - 0.3));
        collisionTiles.push(this.room.map.getTileAt(this.x + this.width * 0.5 - 0.3, this.y + this.height * 0.5 - 0.3));

        for (var i = 0; i < collisionTiles.length; i++) {
            var tile = collisionTiles[i];
            if (tile != null && tile.hasCollision) {
                if (x) {
                    if (speed > 0) {
                        this.x = tile.x * this.room.map.tilesize - this.width * 0.5;
                    } else if (speed < 0) {
                        this.x = tile.x * this.room.map.tilesize + this.room.map.tilesize + this.width * 0.5;
                    }
                    this.xSpeed = 0;
                } else {
                    if (speed > 0) {
                        this.y = tile.y * this.room.map.tilesize - this.height * 0.5;
                        this.onGround = true;
                    }
                    else if (speed < 0) {
                        this.y = tile.y * this.room.map.tilesize + this.room.map.tilesize + this.height * 0.5;
                    }
                    this.ySpeed = 0;
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
        ctx.beginPath();
        ctx.rect((this.x + camera.offset.x - this.width * 0.5) * camera.zoom, (this.y + camera.offset.y - this.height * 0.5) * camera.zoom, this.width * camera.zoom, this.height * camera.zoom);
        ctx.fillStyle = this.color;

        ctx.stroke();
        ctx.fill();
    }
}

enum ENTITY_TYPE {
    PLAYER
}