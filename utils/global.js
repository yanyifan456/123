
/**
 * 获取系统信息（状态栏、高度导航栏、屏幕尺寸）
 * @returns {Object} {
 *   statusBarHeight,       // 状态栏高度 px
 *   navBarHeight,          // 顶部导航栏高度 px（状态栏 + 胶囊按钮高度 + 上下间距）
 *   screenHeight,          // 屏幕高度 px
 *   screenWidth,           // 屏幕宽度 px
 *   menuButtonRect         // 胶囊按钮位置信息
 * }
 */
export function getSystemInfo() {
  let systemInfo = {};
  let menuButton = null;

  try {
    // 获取系统信息
    systemInfo = uni.getSystemInfoSync();
  } catch (err) {
    console.error("获取系统信息失败", err);
    systemInfo = {
      statusBarHeight: 0,
      screenHeight: 0,
      screenWidth: 0,
    };
  }

  try {
    // 获取胶囊按钮位置信息（小程序右上角菜单按钮）
    // menuButton = uni.getMenuButtonBoundingClientRect();
  } catch (err) {
    console.warn("获取胶囊按钮信息失败", err);
    menuButton = null;
  }

  // 状态栏高度
  const statusBarHeight = systemInfo.statusBarHeight || 0;

  // 顶部导航栏高度
  let navBarHeight = 44 + statusBarHeight; // 默认值 iOS 44 + 状态栏
  if (menuButton) {
    const gap = menuButton.top - statusBarHeight; // 胶囊上边距
    navBarHeight = statusBarHeight + menuButton.height + gap * 2;
  }

  return {
    statusBarHeight,
    navBarHeight,
    screenHeight: systemInfo.screenHeight || 0,
    screenWidth: systemInfo.screenWidth || 0,
    menuButtonRect: menuButton,
  };
}