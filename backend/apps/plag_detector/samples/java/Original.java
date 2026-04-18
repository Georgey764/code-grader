public class Original {
    public static double calculateAverage(int[] numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return (double) total / numbers.length;
    }

    public static int findMax(int[] numbers) {
        int maximum = numbers[0];
        for (int num : numbers) {
            if (num > maximum) {
                maximum = num;
            }
        }
        return maximum;
    }

    public static void main(String[] args) {
        int[] data = {4, 7, 2, 9, 1, 5};
        System.out.println("Average: " + calculateAverage(data));
        System.out.println("Maximum: " + findMax(data));
    }
}