#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_PATH_LENGTH 2048

int main(int argc, char *argv[]) {
  // Get the path of the current executable
  char executable_path[MAX_PATH_LENGTH];
  ssize_t path_length = readlink("/proc/self/exe", executable_path, MAX_PATH_LENGTH - 1);
  if (path_length == -1) {
    perror("readlink");
    return 1;
  }
  executable_path[path_length] = '\0';

  // Extract the directory path
  char *directory_path = strrchr(executable_path, '/');
  if (directory_path == NULL) {
    fprintf(stderr, "Error: Could not find executable directory\n");
    return 1;
  }
  *(directory_path + 1) = '\0';

  // Get the current PATH environment variable
  char *path_variable = getenv("PATH");
  if (path_variable == NULL) {
    fprintf(stderr, "Error: Could not get PATH environment variable\n");
    return 1;
  }

  // Check if the directory is already in the PATH
  if (strstr(path_variable, directory_path) != NULL) {
    printf("Directory %s is already in the PATH.\n", directory_path);
    return 0;
  }

  // Create a new PATH string with the directory added
  char new_path[MAX_PATH_LENGTH];
  snprintf(new_path, MAX_PATH_LENGTH, "%s:%s", path_variable, directory_path);

  // Set the new PATH environment variable
  setenv("PATH", new_path, 1);
  if (getenv("PATH") == NULL || strcmp(getenv("PATH"), new_path) != 0) {
    fprintf(stderr, "Error: Could not set PATH environment variable\n");
    return 1;
  }

  printf("Successfully added %s to the PATH environment variable.\n", directory_path);

  return 0;
}
