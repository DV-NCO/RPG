import Phaser from 'phaser';

const PIXEL_SPRITES: Record<string, string> = {
  player:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAASFBMVEUAAABJSUmYmJjU1NTf39/l5eX7+/vQ0NCMjIzn5+fPz8/Ly8vz8/PBwcGmpqbk5OTx8fHh4eG+vr6/v7+Wlpbq6uqvr6+Hh4fX19dtb2T2AAAAEHRSTlMABAwRHyIjMz1JS2NrbHh9iE8fHwAAAFJJREFUGNNjYIABRiZmBiYmViBggJGRmZkYGBlZGRiYORlZOTg5eTm5uHl5ufg4eXk4ODk5eHi4uDl5eXl4ODi5ubm4eHi5+fg4ODn5+fgAQBljg5PE0X58gAAAABJRU5ErkJggg==',
  shadow:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAVFBMVEUAAABwcHCmpqbW1tbv7+/T09PX19fc3Nzk5OT29va7u7u6urqsrKynp6epqamsrKympqazs7PExMTf39/k5OTg4ODu7u7g4ODi4uL////Ly8vS0tKUlJS3i74bAAAAFHRSTlMAAwQHDhAVGiIjKzM1Q0ZJZ2lvcX2NnN8RAAAAV0lEQVQY023ORxKAIAwF0AgYCBzw/39JrTjD1gkiz9QZGRpmZ8CKDGlxyHCMxCE6YxgghGkMkM0HETXCAgRyMgDArHAvKIh/m79CcufG97+2u7YpfaIF1A/7k4z6WRtPAAAAAElFTkSuQmCC',
  lightborn:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAUVBMVEUAAAB/f39qamqioqK3t7fCwsLDw8O5ubm1tbWtra3GxsbOzs7V1dXf39/o6Oj////a2trS0tLk5OTs7OzR0dHc3Nzb29vHx8e/v79xSpZ/AAAAE3RSTlMAAgMEBxQdKS4zRkhNTlBfZG1z98uxAAAAW0lEQVQY02NgoCigJiYGBiYmZkCFiYGRgYmNhY+JjYGVk4OLg4WHi4uDl4+Pj4eHi4OHh5ePj4+Pi4eHk4ODk5+fh5OTg4uPg4ODk5OTg4uLi4OHh4+Pj4OEAAPjLBiW6QVWBAAAAAElFTkSuQmCC',
  nightborn:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAWlBMVEUAAAB0dHRoaGh2dnZubm6BgYFUVFRTU1NiYmJ6enqAgICpqamzs7O+vr6+vr7f39/m5ub////k5OTw8PDX19fz8/Pb29ve3t7o6OjZ2dna2tq0tLTJyclVVVUgFylHAAAAF3RSTlMAAQMGCQ8SFh4jKzE3SE9TVWBkb3F9oapwAAAAWU1EQVQY02NgoCigJiZGBiYGBiYmRgYGBiZmBiY2BjYGBgY2Rj4GBgY2Hk4+Lg4eDh4eLi4+Pj4eLi4eHh4+Pj4uHk4ODm4+Dh4ODk5ODg4eHh4+Pj4OEAAPkPBiWgDWxTAAAAAElFTkSuQmCC',
  boss:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAaVBMVEUAAABSUlKdnZ3AwMB3d3dzc3Ovr6/ExMTa2tqTk5PHx8fZ2dnS0tL////w8PDs7Ozd3d3o6OjY2NjU1NTf39/p6enl5eXl5eX09PTg4ODX19fCwsLEwsOPj4/b29vu7u7m5ubd3d3V1dUqG4B7AAAAFXRSTlMABBUeIycsMDZIVVpdZ2lwfoCNqrzWAAAAaUlEQVQY023OxRKAIAxEUQkICjbg/7+3Mqt1LGSwzQ4SE9OsuwBUc7UQBA2Hn5GI0rYF10O4CFVJQgQygEeuIQCKBMk4gAVoBs4wFtPhP7vYj01ezv7u0q7U5d+ZfjSkgW0Pdt8WlY9oP+mBRbuDH/wAAAAASUVORK5CYII=',
  tiles:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAyklEQVR4Ae3SQQ7CMAwF0MkzuAG3gZuM4AZsg9m4BXaZMWYI3GB20NstJG8Kk7yJSS+M3/7sSYgfg0HwgXoIUR8oZgo01u5Pq41UPCF0FDlF1hT6guEqcpRjv+2iDg6nJS/CR2vjb6b5N8jdzBW9kXX5N4E64t6lrzGPYF8q2+ew34j5FXWfYs8gfy7b5bDfiPkVdZ9izxB/LtvlvN+I+RV1n2LPEH8u2+W838j5FXWfYs8Qfy7b5b3fiPkVdZ9i3xAf3eKUNuxgrznEKus0khR6ymEPcY9hZlT2B4AAAAAElFTkSuQmCC'
};

const AUDIO_SFX = {
  click:
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=',
  hit:
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=',
  swap:
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA='
};

const AUDIO_MUSIC = {
  loop:
    'data:audio/ogg;base64,T2dnUwACAAAAAAAAAABVDxk6AAAAACvtnxUBHgF2b3JiaXMAAAAAAkSsAAAAAABPZ2dTAAAAAAAAAAAAFQ8ZOgEAAABY7Z8VASoBAE9nZ1MAAAAAAAAAAABVDxk6AgAAAE/tmxUBMgIA'
};

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    Object.entries(PIXEL_SPRITES).forEach(([key, data]) => {
      this.textures.addBase64(key, data);
    });

    Object.entries(AUDIO_SFX).forEach(([key, data]) => {
      this.load.audio(key, data);
    });

    Object.entries(AUDIO_MUSIC).forEach(([key, data]) => {
      this.load.audio(key, data);
    });
  }

  create(): void {
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
    this.scene.start('PreloadScene');
  }
}
