import {
  useGetAllMessagesQuery,
  useMarkMessageResolvedMutation,
} from '../features/contact/contactApi';

const AdminContactList = () => {
  const { data: messages, isLoading, isError } = useGetAllMessagesQuery({});
  const [markResolved] = useMarkMessageResolvedMutation();

  const handleMarkResolved = async (id: string) => {
    try {
      await markResolved(id).unwrap();
    } catch (err) {
      console.error('Failure to teach the message as a solution:', err);
    }
  };

  if (isLoading) return <p className="text-center mt-10">...جاري تحميل الرسائل</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error Loading</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">📥 Users Messages </h1>
      {messages?.length === 0 ? (
        <p className="text-center">No Messages.</p>
      ) : (
        <div className="space-y-6">
          {messages.map((msg: any) => (
            <div
              key={msg._id}
              className={`border p-4 rounded ${msg.isResolved ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>👤 Name:</strong> {msg.name}</p>
                  <p><strong>📧 Email:</strong> {msg.email}</p>
                  <p><strong>📝 Subject:</strong> {msg.subject}</p>
                  <p><strong>🕒 Date:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                {!msg.isResolved && (
                  <button
                    onClick={() => handleMarkResolved(msg._id)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                   Done✅
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap"><strong>📨 Message:</strong> {msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactList;
