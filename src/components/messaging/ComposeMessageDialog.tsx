
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Send } from 'lucide-react';
import { RecipientSearch } from './RecipientSearch';

const messageFormSchema = z.object({
  recipient_id: z.string().min(1, { message: "Veuillez sélectionner un destinataire." }),
  subject: z.string().min(1, { message: "Le sujet ne peut pas être vide." }),
  content: z.string().min(1, { message: "Le message ne peut pas être vide." }),
  priority: z.enum(['low', 'normal', 'high']),
});

export type MessageFormData = z.infer<typeof messageFormSchema>;

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: MessageFormData) => void;
  isSending: boolean;
  currentUserId?: string;
  initialData?: Partial<MessageFormData>;
}

export function ComposeMessageDialog({
  open,
  onOpenChange,
  onSend,
  isSending,
  currentUserId,
  initialData,
}: ComposeMessageDialogProps) {
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipient_id: '',
      subject: '',
      content: '',
      priority: 'normal',
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        recipient_id: '',
        subject: '',
        content: '',
        priority: 'normal',
        ...initialData,
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: MessageFormData) => {
    onSend(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau Message</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipient_id"
                render={({ field }) => (
                  <RecipientSearch
                    value={field.value}
                    onChange={field.onChange}
                    currentUserId={currentUserId}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Définir la priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sujet du message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Votre message..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                type="submit"
                className="bg-humanitarian-blue hover:bg-blue-700"
                disabled={isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
