import KalmanFilter from 'kalmanjs';
// const cv = window.cv;
import cv from '@techstark/opencv-js';

const kalmanconfig = { R: 1, Q: 50 };
const smooth = (name, value) => {
  return cache[name].filter(value);
};
const cache = {
  nosetipx: new KalmanFilter(kalmanconfig),
  nosetipy: new KalmanFilter(kalmanconfig),
  frontx: new KalmanFilter(kalmanconfig),
  fronty: new KalmanFilter(kalmanconfig),
  topx: new KalmanFilter(kalmanconfig),
  topy: new KalmanFilter(kalmanconfig),
  sidex: new KalmanFilter(kalmanconfig),
  sidey: new KalmanFilter(kalmanconfig),
};
export class HeadPosition {
  constructor(positions, dims) {
    this.selectedOpenCvMethod = '0';
    this.noseTip = positions[30];
    this.bottomNose = positions[33];
    this.lefteyeleftcorner = positions[36];
    this.lefteyerightcorner = positions[39];
    this.righteyerightcorner = positions[45];
    this.righteyeleftcorner = positions[42];
    this.leftmouth = positions[48];
    this.rightmouth = positions[54];
    this.leftnostril = positions[31];
    this.rightnostril = positions[35];
    this.focal_length = dims.width;
    this.center = [dims.width / 2, dims.height / 2];
  }
  estimateHeadPose() {
    const imagePoints = cv.matFromArray(10, 2, cv.CV_64F, [
      this.noseTip._x,
      this.noseTip._y,
      this.bottomNose._x,
      this.bottomNose._y,
      this.leftnostril._x,
      this.leftnostril._y,
      this.rightnostril._x,
      this.rightnostril._y,
      this.lefteyeleftcorner._x,
      this.lefteyeleftcorner._y,
      this.lefteyerightcorner._x,
      this.lefteyerightcorner._y,
      this.righteyerightcorner._x,
      this.righteyerightcorner._y,
      this.righteyeleftcorner._x,
      this.righteyeleftcorner._y,
      this.leftmouth._x,
      this.leftmouth._y,
      this.rightmouth._x,
      this.rightmouth._y,
    ]);
    //from sparkar
    const objectPoints = cv.matFromArray(10, 3, cv.CV_64F, [
      //nose tip
      0.0,
      0.0,
      0.0,
      // bottom nose
      0.0,
      -60.0,
      -78.0,
      // left nostril
      -67.0,
      -58.0,
      -100.0,
      // right nostril
      67.0,
      -58.0,
      -100.0,
      //lefteyeleftcorner
      -262.0,
      168.0,
      -240.0,
      //lefteyerightcorner
      -115.0,
      170.0,
      -210.0,
      //righteyerightcorner
      262.0,
      168.0,
      -240.0,
      //righteyeleftcorner
      115.0,
      170.0,
      -210.0,
      // // left mouth corner
      -148.0,
      -192.0,
      -181.0,
      //rightmouthcorner
      148.0,
      -192.0,
      -181.0,
    ]);
    const cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [
      this.focal_length,
      0,
      this.center[0],
      0,
      this.focal_length,
      this.center[1],
      0,
      0,
      1,
    ]);
    const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
    const rvec = new cv.Mat();
    const tvec = new cv.Mat();
    const outinliers = new cv.Mat();
    cv.solvePnPRansac(objectPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec, false, 100, 8.0, 0.99, outinliers, parseInt(this.selectedOpenCvMethod, 10));
    cv.solvePnPRefineVVS(objectPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec);
    const pointf = cv.matFromArray(3, 1, cv.CV_64F, [0, 0, 1000]);
    const outarrf = new cv.Mat();
    const jacobf = new cv.Mat();
    cv.projectPoints(pointf, rvec, tvec, cameraMatrix, distCoeffs, outarrf, jacobf);
    let frontx = outarrf.data64F[0];
    let fronty = outarrf.data64F[1];
    const pointt = cv.matFromArray(3, 1, cv.CV_64F, [0, 1000, 0]);
    const outarrt = new cv.Mat();
    const jacobt = new cv.Mat();
    cv.projectPoints(pointt, rvec, tvec, cameraMatrix, distCoeffs, outarrt, jacobt);
    let topx = outarrt.data64F[0];
    let topy = outarrt.data64F[1];
    const points = cv.matFromArray(3, 1, cv.CV_64F, [1000, 0, 0]);
    const outarrs = new cv.Mat();
    const jacobs = new cv.Mat();
    cv.projectPoints(points, rvec, tvec, cameraMatrix, distCoeffs, outarrs, jacobs);
    let sidex = outarrs.data64F[0];
    let sidey = outarrs.data64F[1];
    this.drawingData = { noseTip: this.noseTip, frontx, fronty, topx, topy, sidex, sidey };
    return rvec.data64F.map(a => (a / Math.PI) * 180);
  }
  draw(ctx) {
    const { noseTip, frontx, fronty, topx, topy, sidex, sidey } = this.drawingData;
    try {
      const _noseTip = {
        _x: smooth('nosetipx', noseTip.x),
        _y: smooth('nosetipy', noseTip.y),
      };
      const _frontx = smooth('frontx', frontx);
      const _fronty = smooth('fronty', fronty);
      const _topx = smooth('topx', topx);
      const _topy = smooth('topy', topy);
      const _sidex = smooth('sidex', sidex);
      const _sidey = smooth('sidey', sidey);
      ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(_frontx, _fronty, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.arc(_noseTip._x, _noseTip._y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.moveTo(_frontx, _fronty);
      ctx.lineTo(_noseTip._x, _noseTip._y);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.moveTo(_topx, _topy);
      ctx.lineTo(_noseTip._x, _noseTip._y);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.fillStyle = 'blue';
      ctx.moveTo(_sidex, _sidey);
      ctx.lineTo(_noseTip._x, _noseTip._y);
      ctx.stroke();
    }
    catch (err) {
      console.error('errrrr');
      console.error(err);
    }
  }
}
