export function useInterval<T extends (...args: any) => any>(
  cb: T,
  timeout = 2000,
) {
  let timer: NodeJS.Timeout;
  onMounted(() => {
    timer = setInterval(() => {
      cb();
    }, timeout);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });
}
