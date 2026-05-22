function bytesToMB(bytes) {
  if (bytes === 0) {
    return 0; // Handle the case of 0 bytes
  }
  const megabytes = bytes / (1024 * 1024);
  return megabytes;
}

export {
    bytesToMB
}