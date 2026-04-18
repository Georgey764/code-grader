public class Plagiarised {
    // Computes the mean of an array
    public static double computeMean(int[] vals) {
        int s = 0;
        for (int v : vals) {
            s += v;
        }
        return (double) s / vals.length;
    }

    public static int getMaximum(int[] lst) {
        int mx = lst[0];
        for (int v : lst) {
            if (v > mx) {
                mx = v;
            }
        }
        return mx;
    }

    public static void main(String[] args) {
        int[] myArray = {4, 7, 2, 9, 1, 5};
        System.out.println("Mean: " + computeMean(myArray));
        System.out.println("Max: " + getMaximum(myArray));
    }
}