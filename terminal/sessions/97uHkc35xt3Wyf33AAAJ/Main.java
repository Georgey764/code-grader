import java.util.Scanner;
import java.io.File;
import java.io.FileNotFoundException;

public class Main {
    public static void main(String[] args){
        try {
            File myFile = new File("./input.txt");
            Scanner reader = new Scanner(myFile);
            
            while (reader.hasNextInt()) {                          
                Integer a = reader.nextInt();
                Integer b = reader.nextInt();
                System.out.println(a + b);
            }
            reader.close();
        } catch (FileNotFoundException e) {
            System.out.println("File not found.");
        }
    }
}