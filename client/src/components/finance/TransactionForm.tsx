import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertTransaction, insertTransactionSchema } from "@shared/schema";

// Extend the transaction schema with validation
const transactionFormSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, { message: "Amount is required" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
});

// Transaction form component
export default function TransactionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Setup form with default values
  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: "",
      category: "",
      amount: "",
      type: "income",
      status: "completed"
    }
  });
  
  // Setup mutation for form submission
  const submitMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      return apiRequest("POST", "/api/transactions", {
        ...data,
        amount: parseFloat(data.amount as unknown as string)
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction added",
        description: "The transaction has been successfully added.",
        variant: "default"
      });
      
      // Reset form
      form.reset({
        date: new Date().toISOString().split('T')[0],
        description: "",
        category: "",
        amount: "",
        type: "income",
        status: "completed"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error adding transaction",
        description: error.message || "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof transactionFormSchema>) => {
    submitMutation.mutate(data as InsertTransaction);
  };
  
  return (
    <Card className="finance-card">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Add New Transaction</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="income" className="text-[#7da824] border-[#7da824] focus:ring-[#7da824]" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">Income</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="expense" className="text-red-600 border-red-600 focus:ring-red-600" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">Expense</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-12 border-[#DEE2E6] focus-visible:ring-primary formInput"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's this transaction for?"
                      className="border-[#DEE2E6] focus-visible:ring-primary formInput"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#DEE2E6] focus:ring-primary formInput">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dues">Class Dues</SelectItem>
                      <SelectItem value="fundraising">Fundraising</SelectItem>
                      <SelectItem value="donations">Donations</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="materials">Study Materials</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-[#DEE2E6] focus-visible:ring-primary formInput"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="border-[#DEE2E6] hover:bg-gray-50 text-gray-700"
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {submitMutation.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
