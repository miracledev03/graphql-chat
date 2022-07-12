import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { getAccessToken } from '../auth';
import { ADD_MESSAGE_MUTATION, MESSAGES_QUERY, MESSAGE_ADDED_SUBSCRIPTION } from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(ADD_MESSAGE_MUTATION);
  return {
    addMessage: async (text) => {
      const { data: { message } } = await mutate({
        variables: { input: { text } },
        context: {
          headers: { 'Authorization': 'Bearer ' + getAccessToken() },
        },
        // update: (cache, { data: { message } }) => {
        //   cache.updateQuery({ query: MESSAGES_QUERY }, ({ messages }) => {
        //     const newData = {
        //       messages: [...messages, message],
        //     };

        //     return newData;
        //   });
        // }
      });
      return message;
    },
  };
}

export function useMessages() {
  const { data } = useQuery(MESSAGES_QUERY, {
    context: {
      headers: { 'Authorization': 'Bearer ' + getAccessToken() },
    },
  });

  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const message = subscriptionData.data.message;
      
      client.cache.updateQuery({ query: MESSAGES_QUERY }, ({ messages }) => {
        const newData = {
          messages: [...messages, message],
        };

        return newData;
      });
    }
  })

  return {
    messages: data?.messages ?? [],
  };
}
