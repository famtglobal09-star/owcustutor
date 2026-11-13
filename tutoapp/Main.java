public class Main {
  static int divide(int total, int people) {
    if (people == 0) throw new IllegalArgumentException("people cannot be zero");
    return total / people;
  }

  public static void main(String[] args) {
    try {
      System.out.println(divide(20, 4));
      System.out.println(divide(20, 0));
    } catch (IllegalArgumentException error) {
      System.out.println("Handled: " + error.getMessage());
    } finally {
      System.out.println("Request finished");
    }
  }
}