// 기기 픽셀 배율 (고해상도 화면 대응). 메모리 절약을 위해 최대 3배로 제한합니다.
export const DPR = Math.min(window.devicePixelRatio || 1, 3);
