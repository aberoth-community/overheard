import subprocess

# Example python integration using popen

running: bool = True


def event(name: str, data: list[str]) -> None:
  """Handle overheard event"""
  print(name, data)


def run(path: str = "dist/index.js") -> int:
  """Start listener sub-process"""
  process = subprocess.Popen(
    [
      'node', path,
      '-t', '30s'
    ],
    stdout=subprocess.PIPE,
    shell=True
  )
  while running:
    line = process.stdout.readline()
    if line:
      name, *data = line.decode().strip().split(' ')
      event(name, data)
  return 0


# Main
if __name__ == '__main__':
  exit(run())
