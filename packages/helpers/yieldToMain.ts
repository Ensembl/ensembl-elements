declare let scheduler: any;

const yieldToMain = async () => {
  if ('scheduler' in globalThis && 'yield' in scheduler) {
    await scheduler.yield();
  } else {
    await new Promise((resolve) => setTimeout(resolve));
  }
};

export default yieldToMain;