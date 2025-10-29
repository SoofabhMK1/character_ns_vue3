import { createApp, registerElement } from 'nativescript-vue';
import { createPinia } from 'pinia';
import Home from './components/Home.vue';

// 使用 TabView（核心模块存在：@nativescript/core/ui/tab-view）
try {
  const tabViewModule = () => require('@nativescript/core/ui/tab-view');
  registerElement('TabView', () => tabViewModule().TabView as any);
  registerElement('TabViewItem', () => tabViewModule().TabViewItem as any);
} catch (e) {
  // 兜底：若注册失败，应用仍可启动
}

const app = createApp(Home);
app.use(createPinia());
app.start();
